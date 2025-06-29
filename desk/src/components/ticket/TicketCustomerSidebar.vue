<template>
  <div class="flex w-[382px] flex-col border-l gap-4">
    <!-- Ticket ID -->
    <div class="flex items-center justify-between border-b px-5 py-3">
      <span class="cursor-copy text-lg font-semibold me-3">#{{ ticket.data.name }}</span>
    </div>
    <!-- user info and sla info -->
    <div class="flex flex-col gap-4 pt-0 px-5 py-3 border-b">
      <!-- user info -->
      <div class="flex gap-2">
        <Avatar size="2xl" :image="ticket.data.contact.image" :label="ticket.data.contact.name" />
        <div class="flex items-center justify-between">
          <Tooltip :text="ticket.data.contact.name">
            <div class="w-[242px] truncate text-2xl font-medium">
              {{ ticket.data.contact.name }}
            </div>
          </Tooltip>
          <div class="flex gap-1.5" v-if="!ticket.data.feedback_rating">
            <Tooltip :text="ticket.data.contact.email_id">
              <Button class="h-7 w-7" @click="emit('open')">
                <EmailIcon class="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      <!-- Ticket Info -->
      <!-- <div class="flex items-center text-base leading-5">
        <span class="w-[126px] text-sm text-gray-600">Ticket ID</span>
        <span class="text-base text-gray-800 flex-1"> {{ ticket.data.name }} </span>
      </div> -->

      <!-- <div class="flex items-center text-base leading-5">
        <span class="w-[126px] text-sm text-gray-600">Detailed Status</span>
        <span class="text-base text-gray-800 flex-1">
          <Badge :label="ticket.data.status" :theme="colorMap[ticket.data.status]" variant="outline" />
        </span>
      </div> -->


      <!-- sla info -->
      <div v-for="data in slaData" :key="data.label" class="flex items-center text-base">
        <div class="w-[126px] text-gray-600 text-sm">{{ data.title }}</div>

        <div class="break-words text-base text-gray-800">
          <Tooltip :text="dayjs(data.value).long()">
            <Badge :label="data.label" :theme="data.theme" variant="outline" />
          </Tooltip>
        </div>
      </div>
      <div class="flex items-center text-base">
        <div class="w-[126px] text-gray-600 text-sm">Related SLA</div>

        <div class="break-words text-base text-gray-800">
          <Tooltip text="Read Service Level Agreement">
            <p @click="readSlaDescription" style="cursor: pointer;">{{ ticket.data.sla }}<span> <svg
                  style="display: inline-block; width: 17px; margin: 5px 5px;" xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5">
                    <path stroke-linejoin="round" d="M21 3h-6m6 0l-9 9m9-9v6" />
                    <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                  </g>
                </svg></span></p>
          </Tooltip>
        </div>
      </div>
    </div>
    <!-- feedback component -->
    <TicketFeedback v-if="ticket.data.feedback_rating" class="border-b text-base text-gray-600" :ticket="ticket.data" />

    <Dialog v-model="readNonSlaDetailsDialog" :options="{ size: '4xl' }">
      <template #body-title>
        <h3>Non-SLA Request Evaluation Form ({{ ticket.data.ehda_non_sla_form }})</h3>
      </template>
      <template #body-content>

        <div class="grid grid-cols-2 gap-4" v-if="nonSlaEvalForm">
          <Input :modelValue="nonSlaEvalForm.workflow_state" label="Workflow Status" type="text" disabled />

          <Input :modelValue="nonSlaEvalForm.related_quotation" label="Related Quotation (if paid)" disabled />

          <!-- ----- -->
          <div></div>

          <Input :modelValue="nonSlaEvalForm.related_project" label="Related Project (if approved)" disabled />

          <!-- ----- -->

          <div class="grid grid-cols-1">
            <p style="color: gray;">Meeting with Customer Details (if any)</p>
            <Textarea :variant="'subtle'" :ref_for="true" size="sm" placeholder="Placeholder"
              :value="nonSlaEvalForm.meeting_with_customer_details_if_any" disabled />
          </div>
          <!-- ----- -->

          <Input :modelValue="nonSlaEvalForm.impact_scope" label="Impact Scope" disabled />

          <Input :modelValue="nonSlaEvalForm.technical_complexity" label="Technical Complexity" disabled />


          <!-- ----- -->

          <Input :modelValue="nonSlaEvalForm.urgency_from_customer" label="Urgency from Customer" disabled />

          <Input :modelValue="nonSlaEvalForm.can_it_be_reused" label="Can it be reused ?" disabled />

          <!-- ----- -->

          <Input :modelValue="nonSlaEvalForm.estimated_effort_in_hours" label="Estimated Effort (in hours)" disabled />

          <!-- ----- -->

          <Tooltip :text="nonSlaEvalForm.cancellation_reason.map(el => el.link_afkn).join(', ')">
            <Input :modelValue="nonSlaEvalForm.cancellation_reason.map(el => el.link_afkn).join(', ')"
              label="Request Cancellation Reason" disabled />
          </Tooltip>

          <Tooltip :text="nonSlaEvalForm.quotation_rejection_reason.map(el => el.link_kyjp).join(', ')">
            <Input :modelValue="nonSlaEvalForm.quotation_rejection_reason.map(el => el.link_kyjp).join(', ')"
              label="Quotation Rejection Reason" disabled />
          </Tooltip>
        </div>

        <br>
        <div class="grid grid-cols-1" v-if="nonSlaEvalForm.additional_notes">
          <p style="color: gray;">Additional Notes</p>
          <Textarea :variant="'subtle'" :ref_for="true" size="sm" placeholder="Placeholder"
            :value="nonSlaEvalForm.additional_notes" disabled />
        </div>

      </template>

      <template #actions>
        <Button class="ml-2" @click="readNonSlaDetailsDialog = false">
          Close
        </Button>
      </template>
    </Dialog>

    <div class="flex flex-col gap-4 pt-0 px-5 py-3">
      <div class="flex items-center text-base leading-5">
        <span class="w-[126px] text-sm text-gray-600">Subject</span>
        <span class="text-base text-gray-800 flex-1">{{ ticket.data.subject }}</span>
      </div>

      <div class="flex items-center text-base leading-5" v-if="ticket.data.agent_group">
        <span class="w-[126px] text-sm text-gray-600">Team</span>
        <span class="text-base text-gray-800 flex-1">{{ ticket.data.agent_group || "-" }}</span>
      </div>

      <div class="flex items-center text-base leading-5">
        <span class="w-[126px] text-sm text-gray-600">Priority</span>
        <span class="text-base text-gray-800 flex-1">{{ ticket.data.priority }}</span>
      </div>

      <div class="flex items-center text-base leading-5">
        <span class="w-[126px] text-sm text-gray-600">Site</span>
        <span class="text-base text-gray-800 flex-1">{{ ticket.data.ehda_etms_erp_site }}<span><svg
              style="display: inline-block; width: 17px; margin: 5px 5px;" xmlns="http://www.w3.org/2000/svg" width="24"
              height="24" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                color="currentColor">
                <circle cx="12" cy="12" r="10" />
                <ellipse cx="12" cy="12" rx="4" ry="10" />
                <path d="M2 12h20" />
              </g>
            </svg></span></span>
      </div>

      <div class="flex items-center text-base leading-5" v-if="ticket.data.last_replay_by">
        <span class="w-[126px] text-sm text-gray-600">Last Replay By</span>
        <span class="text-base text-gray-800 flex-1">{{ ticket.data.last_replay_by }}</span>
      </div>

      <div class="flex items-center text-base leading-5" v-if="ticket.data.ehda_non_sla_form">
        <span class="w-[126px] text-sm text-gray-600">Non SLA Status</span>
        <span class="text-base text-gray-800 flex-1">{{ ticket.data.ehda_non_sla_status }}</span>
      </div>

      <div class="flex items-center text-base leading-5" v-if="ticket.data.ehda_non_sla_form">
        <span class="w-[126px] text-sm text-gray-600">Non SLA Form</span>
        <span @click="readNonSlaDetails" class="text-base text-gray-800 flex-1" style="cursor: pointer;">{{
          ticket.data.ehda_non_sla_form }} <span> 📃</span></span>
      </div>

      <div class="flex items-center text-base leading-5" v-if="ticket.data.ehda_non_sla_form_project">
        <span class="w-[126px] text-sm text-gray-600">Non SLA Project</span>
        <span class="text-base text-gray-800 flex-1">{{ ticket.data.ehda_non_sla_form_project }}</span>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref } from "vue";
import { ITicket } from "@/pages/ticket/symbols";
import { Tooltip, Avatar, call, Input, Textarea } from "frappe-ui";
import { dayjs } from "@/dayjs";
import { formatTime } from "@/utils";
import { globalStore } from "@/stores/globalStore";
import { useTicketStatusStore } from "@/stores/ticketStatus";
import { NonSLAEvalForm } from "@/types";

const emit = defineEmits(["open"]);
const { $dialog } = globalStore();
const { colorMap } = useTicketStatusStore();

const ticket = inject(ITicket);
let nonSlaEvalForm = ref<NonSLAEvalForm>()
let readNonSlaDetailsDialog = ref(false)
const slaData = computed(() => {
  const firstResponse = firstResponseData();
  const resolution = resolutionData();
  return [
    {
      title: "First Response",
      value: ticket.data.first_responded_on || ticket.data.response_by,
      label: firstResponse.label,
      theme: firstResponse.color,
    },
    {
      title: "Resolution",
      value: ticket.data.resolution_date || ticket.data.resolution_by,
      label: resolution.label,
      theme: resolution.color,
    },
  ];
});

function firstResponseData() {
  let firstResponse = null;
  if (
    !ticket.data.first_responded_on &&
    dayjs().isBefore(dayjs(ticket.data.response_by))
  ) {
    firstResponse = {
      label: `Due in ${formatTime(
        dayjs(ticket.data.response_by).diff(dayjs(), "s")
      )}`,
      color: "orange",
    };
  } else if (
    dayjs(ticket.data.first_responded_on).isBefore(
      dayjs(ticket.data.response_by)
    )
  ) {
    firstResponse = {
      label: `Fulfilled in ${formatTime(
        dayjs(ticket.data.first_responded_on).diff(
          dayjs(ticket.data.creation),
          "s"
        )
      )}`,
      color: "green",
    };
  } else {
    firstResponse = {
      label: "Failed",
      color: "red",
    };
  }
  return firstResponse;
}

function resolutionData() {
  let resolution = null;
  if (
    !ticket.data.resolution_date &&
    dayjs().isBefore(ticket.data.resolution_by)
  ) {
    resolution = {
      label: `Due in ${formatTime(
        dayjs(ticket.data.resolution_by).diff(dayjs(), "s")
      )}`,
      color: "orange",
    };
  } else if (
    dayjs(ticket.data.resolution_date).isBefore(ticket.data.resolution_by)
  ) {
    resolution = {
      label: `Fulfilled in ${formatTime(
        dayjs(ticket.data.resolution_date).diff(
          dayjs(ticket.data.creation),
          "s"
        )
      )}`,
      color: "green",
    };
  } else {
    resolution = {
      label: "Failed",
      color: "red",
    };
  }
  return resolution;
}

function readNonSlaDetails() {
  call("helpdesk.api.doc.get_non_sla_doc", {
    ticket_name: ticket.data.name,
    non_sla_name: ticket.data.ehda_non_sla_form
  }).then((res: NonSLAEvalForm) => {
    if (res) {
      nonSlaEvalForm.value = res
      readNonSlaDetailsDialog.value = true
    } else {
      console.log('no customer linked to user: ');
    }
  }).finally((er) => {
    // $(document.body).css("filter", "opacity(1)")
  })
}

function readSlaDescription() {
  $dialog({
    title: `Service Level Agreement (${ticket.data.sla})`,
    html: `<div style="direction: rtl">${ticket.data.sla_description}</div>`,
    style: 'direction: rtl;',
    size: '30%',
    actions: [
      {
        label: "Close",
        variant: "solid",
        // theme: theme,
        onClick(close: Function) {
          close();
        },
      },
    ],
  });
}

// const ticketBasicInfo = computed(() => [
//   {
//     label: "Ticket ID",
//     value: ticket.data.name,
//   },
//   {
//     label: "Status",
//     value: ticket.data.status,
//     // value: transformStatus(ticket.data.status),
//     bold: true,
//   },
// ]);

// const ticketAdditionalInfo = computed(() => {

//   const fields = [
//     {
//       label: "Subject",
//       value: ticket.data.subject,
//     },
//     {
//       label: "Team",
//       value: ticket.data.agent_group || "-",
//     },
//     {
//       label: "Priority",
//       value: ticket.data.priority,
//     },
//   ];

//   const fields2 = [

//     ...ticket.data.ehda_non_sla_form ? [
//       {
//         label: "Non SLA Status",
//         value: ticket.data.ehda_non_sla_status,
//       },
//       {
//         label: "Non SLA Form",
//         value: ticket.data.ehda_non_sla_form,
//       },
//       ...ticket.data.ehda_non_sla_form_project ? [
//         {
//           label: "Non SLA Project",
//           value: ticket.data.ehda_non_sla_form_project,
//         },
//       ] : []
//     ] : []
//   ];
//   const custom_fields = ticket.data.template.fields
//     .filter(
//       (field: Field) =>
//         !field.hide_from_customer &&
//         ["subject", "team", "priority"].indexOf(field.fieldname) === -1
//     )
//     .map((field: Field) => ({
//       label: field.label,
//       value: ticket.data[field.fieldname],
//     }));
//   console.log('custom_fields: ', custom_fields);

//   return [...fields, ...custom_fields, ...fields2];
// });
// function transformStatus(status: string) {
//   switch (status) {
//     case "Replied":
//       return "Awaiting reply";
//     default:
//       return status;
//   }
// }
</script>

<style scoped></style>
