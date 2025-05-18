<template>
  <div class="flex flex-col">
    <LayoutHeader v-if="ticket.data">
      <template #left-header>
        <Breadcrumbs :items="breadcrumbs" class="breadcrumbs">
          <template #prefix="{ item }">
            <Icon v-if="item.icon" :icon="item.icon" class="mr-1 h-4 flex items-center justify-center self-center" />
          </template>
        </Breadcrumbs>
      </template>
      <template #right-header>
        <CustomActions v-if="ticket.data._customActions" :actions="ticket.data._customActions" />
        <div v-if="ticket.data.assignees?.length">
          <component :is="ticket.data.assignees.length == 1 ? 'Button' : 'div'">
            <MultipleAvatar :avatars="ticket.data.assignees" @click="showAssignmentModal = true" />
          </component>
        </div>
        <button v-else class="rounded bg-gray-100 px-2 py-1.5 text-base text-gray-800"
          @click="showAssignmentModal = true">
          Assign
        </button>
        <Button :variant="'subtle'" :ref_for="true" v-if="ticket.data.ehda_non_sla_form" @click="openRelatedNonSla"
          theme="gray" size="sm" label="Button" :loading="false" :loadingText="null" :disabled="false" :link="null">
          Open Non-SLA Form
        </Button>
        <!-- <Button :variant="'subtle'" :ref_for="true" v-if="!ticket.data.ehda_non_sla_form && ticket.data.ehda_detailed_status == `Non-SLA – Transferred for Evaluation`"
          @click="createNonSla" theme="gray" size="sm" label="Button" :loading="false" :loadingText="null"
          :disabled="false" :link="null">
          Create Non-SLA Form
        </Button> -->
        <!-- hd plus: detailed status -->
        <Dropdown :options="detailedStatusOptions">
          <template #default="{ open }">
            <Button :label="ticket.data.ehda_detailed_status">
              <template #prefix>
                <IndicatorIcon :class="ticketStatusStore.detailedTextColorMap[ticket.data.ehda_detailed_status]" />
              </template>
              <template #suffix>
                <FeatherIcon :name="open ? 'chevron-up' : 'chevron-down'" class="h-4" />
              </template>
            </Button>
          </template>
        </Dropdown>
        <!-- <Dropdown :options="dropdownOptions">
          <template #default="{ open }">
            <Button :label="ticket.data.status">
              <template #prefix>
                <IndicatorIcon :class="ticketStatusStore.textColorMap[ticket.data.status]" />
              </template>
              <template #suffix>
                <FeatherIcon :name="open ? 'chevron-up' : 'chevron-down'" class="h-4" />
              </template>
            </Button>
          </template>
        </Dropdown> -->
      </template>
    </LayoutHeader>
    <div v-if="ticket.data" class="flex h-full overflow-hidden">
      <div class="flex flex-1 flex-col">
        <!-- ticket activities -->
        <div class="overflow-y-hidden flex flex-1 !h-full flex-col">
          <Tabs v-model="tabIndex" :tabs="tabs">
            <TabList />
            <TabPanel v-slot="{ tab }" class="h-full">
              <TicketAgentActivities ref="ticketAgentActivitiesRef" :activities="filterActivities(tab.name)"
                :title="tab.label" :ticket-status="ticket.data?.status" @update="
                  () => {
                    ticket.reload();
                  }
                " @email:reply="
                  (e) => {
                    communicationAreaRef.replyToEmail(e);
                  }
                " />
            </TabPanel>
          </Tabs>
        </div>
        <CommunicationArea ref="communicationAreaRef" v-model="ticket.data" :to-emails="[ticket.data?.raised_by]"
          :cc-emails="[]" :bcc-emails="[]" :key="ticket.data?.name" @update="
            () => {
              ticket.reload();
              ticketAgentActivitiesRef.scrollToLatestActivity();
            }
          " />
      </div>
      <TicketAgentSidebar :ticket="ticket.data" @update="({ field, value }) => updateTicket({ [field]: value })"
        @email:open="(e) => communicationAreaRef.toggleEmailBox()" @reload="ticket.reload()" />
    </div>
    <AssignmentModal v-if="ticket.data" v-model="showAssignmentModal" :assignees="ticket.data.assignees"
      :docname="ticketId" doctype="HD Ticket" @update="
        () => {
          ticket.reload();
        }
      " />
    <!-- Rename Subject Dialog -->
    <Dialog v-model="showSubjectDialog" :options="{ title: 'Rename Subject' }">
      <template #body-content>
        <div class="flex flex-col flex-1 gap-3">
          <FormControl v-model="renameSubject" type="textarea" size="sm" variant="subtle" :disabled="false" />
          <Button variant="solid" :loading="isLoading" label="Rename" @click="handleRename" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, h, watch, onMounted, onUnmounted, provide, ComputedRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Breadcrumbs,
  Dropdown,
  createResource,
  Dialog,
  FormControl,
  Tabs,
  TabPanel,
  TabList,
  call,
} from "frappe-ui";

import {
  LayoutHeader,
  MultipleAvatar,
  AssignmentModal,
  CommunicationArea,
  Icon,
} from "@/components";
import { TicketAgentActivities, TicketAgentSidebar } from "@/components/ticket";
import {
  IndicatorIcon,
  CommentIcon,
  ActivityIcon,
  EmailIcon,
} from "@/components/icons";
import { socket } from "@/socket";
import { useTicketStatusStore } from "@/stores/ticketStatus";
import { useUserStore } from "@/stores/user";
import { globalStore } from "@/stores/globalStore";
import { createToast, getIcon } from "@/utils";
import { setupCustomizations } from "@/composables/formCustomisation";
import { Resource, TabObject, Ticket, TicketTab, View } from "@/types";
import { useView } from "@/composables/useView";

const route = useRoute();
const router = useRouter();

const ticketStatusStore = useTicketStatusStore();
const { getUser } = useUserStore();
const { $dialog } = globalStore();
const ticketAgentActivitiesRef = ref(null);
const communicationAreaRef = ref(null);
const renameSubject = ref("");
const isLoading = ref(false);

const props = defineProps({
  ticketId: {
    type: String,
    required: true,
  },
});
watch(
  () => props.ticketId,
  () => {
    ticket.reload();
  }
);

const { findView } = useView("HD Ticket");

provide("communicationArea", communicationAreaRef);

const showAssignmentModal = ref(false);
const showSubjectDialog = ref(false);

const ticket: Resource<Ticket> = createResource({
  url: "helpdesk.helpdesk.doctype.hd_ticket.api.get_one",
  auto: true,
  makeParams: () => ({
    name: props.ticketId,
  }),
  transform: (data) => {
    if (data._assign) {
      data.assignees = JSON.parse(data._assign).map((assignee) => {
        return {
          name: assignee,
          image: getUser(assignee).user_image,
          label: getUser(assignee).full_name,
        };
      });
    }
    renameSubject.value = data.subject;
  },
  onSuccess: (data) => {
    document.title = data.subject;
    setupCustomizations(ticket, {
      doc: data,
      call,
      router,
      $dialog,
      updateField,
      createToast,
    });
    // console.log(ticket._customActions);
  },
});
function updateField(name: string, value: string, callback = () => { }) {
  updateTicket({ name: value });
  callback();
}

const breadcrumbs = computed(() => {
  let items = [{ label: "Tickets", route: { name: "TicketsAgent" } }];
  if (route.query.view) {
    const currView: ComputedRef<View> = findView(route.query.view as string);
    if (currView) {
      items.push({
        label: currView.value?.label,
        icon: getIcon(currView.value?.icon),
        route: { name: "TicketsAgent", query: { view: currView.value?.name } },
      });
    }
  }
  items.push({
    label: ticket.data?.subject,
    onClick: () => {
      showSubjectDialog.value = true;
    },
  });
  return items;
});

const handleRename = () => {
  if (renameSubject.value === ticket.data?.subject) return;
  updateTicket({ "subject": renameSubject.value });
  showSubjectDialog.value = false;
};

// hd plus detailed status map
const detailedStatusOptions = computed(() =>
  ticketStatusStore.detailedOptions.map((o) => ({
    label: o,
    value: o,
    onClick: () => {
      let toNonSla = o == "Non-SLA – Transferred for Evaluation"
      if (ticket.data.ehda_detailed_status == "Non-SLA – Transferred for Evaluation") {
        createToast({
          title: "Cannot Change Ticket with Linked Non-SLA Form",
          icon: "check",
          iconClasses: "text-red-600",
        });
        return
      }

      let title = `Confirm Transition`
      let message = `Are you sure you want transition from: <br> - <strong>(${ticket.data.ehda_detailed_status}) to (${o})</strong>`
      let confirmBtnText = `Confirm`
      let theme = "green"

      if (toNonSla) {
        title += ` & Create Non-Sla Form`
        message += ` <br>And Create Non-SLA Evaluation Form for this ticket?`
        confirmBtnText += ` & Create Non Sla!`
        theme = "red"
      }

      $dialog({
        title: title,
        html: message,
        actions: [
          {
            label: confirmBtnText,
            variant: "solid",
            theme: theme,
            onClick(close: Function) {
              ticket.data.status = ticketStatusStore.getStatusFromDetailed(ticket.data.ehda_detailed_status);
              ticket.data.ehda_detailed_status = o

              if(toNonSla) {
                call("etms_hd_addons.api.create_non_sla_form", {
                  ticket_name: ticket.data.name
                }).then(res => {
                  if (res.status == 200) {
                    setTimeout(() => {
                      // $(document.body).css("filter", "opacity(1)")
                      createToast({
                        title: "ETMS HD: Non-SLA Form Created & Linked",
                        icon: "alert-circle",
                      });
                      ticket.reload()
                      // setTimeout(() => location.reload(), 1500)
                    }, 1000)
                  }
                }).finally((er) => {
                  // $(document.body).css("filter", "opacity(1)")
                })
              }
              updateTicket({ status: ticket.data.status, ehda_detailed_status: o })

              close();
            },
          },
        ],
      });
    },
    icon: () =>
      h(IndicatorIcon, {
        class: ticketStatusStore.detailedTextColorMap[o],
      }),
  }))
);

const dropdownOptions = computed(() =>
  ticketStatusStore.options.map((o) => ({
    label: o,
    value: o,
    onClick: () => updateTicket({ "status": o }),
    icon: () =>
      h(IndicatorIcon, {
        class: ticketStatusStore.textColorMap[o],
      }),
  }))
);

// watch(
//   () => ticket.data,
//   (val) => {
//     console.log("CUSTOM ACTIONSSS");
//     // console.log(val._customActions);
//   },
//   { deep: true }
// );

const tabIndex = ref(0);
const tabs: TabObject[] = [
  {
    name: "activity",
    label: "Activity",
    icon: ActivityIcon,
  },
  {
    name: "email",
    label: "Emails",
    icon: EmailIcon,
  },
  {
    name: "comment",
    label: "Comments",
    icon: CommentIcon,
  },
];

const activities = computed(() => {
  const emailProps = ticket.data.communications.map((email, idx: number) => {
    return {
      subject: email.subject,
      content: email.content,
      sender: { name: email.user.email, full_name: email.user.name },
      to: email.recipients,
      type: "email",
      key: email.creation,
      cc: email.cc,
      bcc: email.bcc,
      creation: email.creation,
      attachments: email.attachments,
      name: email.name,
      isFirstEmail: idx === 0,
    };
  });

  const commentProps = ticket.data.comments.map((comment) => {
    return {
      name: comment.name,
      type: "comment",
      key: comment.creation,
      commentedBy: comment.commented_by,
      commenter: comment.user.name,
      creation: comment.creation,
      content: comment.content,
      attachments: comment.attachments,
    };
  });

  const historyProps = [...ticket.data.history, ...ticket.data.views].map(
    (h) => {
      return {
        type: "history",
        key: h.creation,
        content: h.action ? h.action : "viewed this",
        creation: h.creation,
        user: h.user.name + " ",
      };
    }
  );

  const sorted = [...emailProps, ...commentProps, ...historyProps].sort(
    (a, b) => new Date(a.creation) - new Date(b.creation)
  );

  const data = [];
  let i = 0;

  while (i < sorted.length) {
    const currentActivity = sorted[i];
    if (currentActivity.type === "history") {
      currentActivity.relatedActivities = [];
      for (let j = i + 1; j < sorted.length + 1; j++) {
        const nextActivity = sorted[j];
        if (nextActivity && nextActivity.type === "history") {
          currentActivity.relatedActivities.push(nextActivity);
        } else {
          data.push(currentActivity);
          i = j - 1;
          break;
        }
      }
    } else {
      data.push(currentActivity);
    }
    i++;
  }
  return data;
});

function filterActivities(eventType: TicketTab) {
  if (eventType === "activity") {
    return activities.value;
  }
  return activities.value.filter((activity) => activity.type === eventType);
}
const isErrorTriggered = ref(false);
function updateTicket(data: Partial<Ticket>) {
  isErrorTriggered.value = false;
  // if (value === ticket.data[fieldname]) return;
  // updateOptimistic(fieldname, value);

  createResource({
    url: "frappe.client.set_value",
    params: {
      doctype: "HD Ticket",
      name: props.ticketId,
      fieldname: data
    },
    debounce: 500,
    auto: true,
    onSuccess: () => {
      isLoading.value = false;
      isErrorTriggered.value = false;
      createToast({
        title: "Ticket updated",
        icon: "check",
        iconClasses: "text-green-600",
      });
      ticket.reload();
    },
    onError: (error) => {
      if (isErrorTriggered.value) return;
      isErrorTriggered.value = true;

      const text = error.exc_type
        ? (error.messages || error.message || []).join(", ")
        : error.message;
      createToast({
        title: error.exc_type || "Error",
        text,
        icon: "alert-triangle",
        iconClasses: "text-red-500",
      });

      ticket.reload();
    },
  });
}
provide("updateTicket", updateTicket)

function updateOptimistic(fieldname: string, value: string) {
  ticket.data[fieldname] = value;
  createToast({
    title: "Ticket updated",
    icon: "check",
    iconClasses: "text-green-600",
  });
}

function createNonSla() {
  console.log(ticket);

  $dialog({
    title: "Confirm Action",
    message: `Are you sure you want Create & Link Non-SLA Evaluation Form for Ticket (${ticket.data.subject})`,
    actions: [
      {
        label: "Create Related Non-SLA",
        theme: "green",
        variant: "solid",
        async onClick(close) {
          // $(document.body).css("filter", "opacity(0.3)")
          call("etms_hd_addons.api.create_non_sla_form", {
            ticket_name: ticket.data.name
          }).then(res => {
            if (res.status == 200) {
              setTimeout(() => {
                // $(document.body).css("filter", "opacity(1)")
                createToast({
                  title: "ETMS HD: Non-SLA Form Created & Linked",
                  icon: "alert-circle",
                });
                ticket.reload()
                // setTimeout(() => location.reload(), 1500)
              }, 1000)
            }
          }).finally((er) => {
            // $(document.body).css("filter", "opacity(1)")
          })

          close();
        },
      },
      {
        label: "Cancel",
        variant: "outline",
        onClick(close) {
          close();
        },
      },
    ],
  }
  );
}

function openRelatedNonSla() {
  open(`/app/non-sla-request-evaluation-form/${ticket.data.ehda_non_sla_form}`)
}

onMounted(() => {
  socket.on("helpdesk:ticket-update", (ticketID) => {
    if (ticketID === Number(props.ticketId)) {
      ticket.reload();
    }
  });
});

onUnmounted(() => {
  document.title = "Helpdesk";
  socket.off("helpdesk:ticket-update");
});
</script>

<style>
.breadcrumbs button {
  background-color: inherit !important;

  &:hover,
  &:focus {
    background-color: inherit !important;
  }
}
</style>
