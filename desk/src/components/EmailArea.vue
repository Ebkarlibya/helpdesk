<template>
  <div v-bind="$attrs"
    class="grow cursor-pointer border-transparent bg-white rounded-md shadow text-base leading-6 transition-all duration-300 ease-in-out">
    <div class="mb-1 flex items-center justify-between gap-2">
      <!-- email design for mobile -->
      <div v-if="isMobileView" class="flex items-center gap-2 text-sm">
        <div class="leading-tight">
          <p>{{ sender.full_name || "No name found" }}</p>
          <Tooltip :text="dateFormat(creation, dateTooltipFormat)">
            <p class="text-xs md:text-sm text-gray-600">
              {{ timeAgo(creation) }}
            </p>
          </Tooltip>
          <p class="sm:flex hidden text-sm text-gray-600" v-if="sender.name">
            {{ "<" + sender.name + ">" }} </p>
        </div>
      </div>
      <!-- email design for desktop -->
      <div v-else class="flex items-center gap-2">
        <span>{{ sender.full_name || "No name found" }}</span>
        <span class="sm:flex hidden text-sm text-gray-600" v-if="sender.name">{{
          "<" + sender.name + ">" }}</span>
      </div>

      <div class="flex gap-0.5 items-center">
        <Tooltip :text="dateFormat(creation, dateTooltipFormat)" v-if="!isMobileView">
          <p class="text-xs md:text-sm text-gray-600">
            {{ timeAgo(creation) }}
          </p>
        </Tooltip>
        <Button variant="ghost" class="text-gray-700" @click="
          emit('reply', {
            content: content,
            to: sender?.name ?? to,
          })
          ">
          <ReplyIcon class="h-4 w-4" />
        </Button>
        <Button variant="ghost" class="text-gray-700" @click="
          emit('reply', {
            content: content,
            to: sender?.name ?? to,
            cc: cc,
            bcc: bcc,
          })
          ">
          <ReplyAllIcon class="h-4 w-4" />
        </Button>
        <Dropdown v-if="showSplitOption" :options="[
          // {
          //   label: 'Split Ticket',
          //   icon: LucideSplit,
          //   onClick: () => (showSplitModal = true),
          // },
          {
            label: 'Delete Email',
            onClick: async () => {
              console.log($props);
              call('etms_hd_addons.api.delete_replay', {
                comm_name: activity.name,
                ticket_name: ticket.data.name
              }).then(res => {
                console.log(res);
                if (res.status == 200) {
                  console.log(props.ticket);
                  sendNotification(res.data)
                  props.ticket.reload()
                } else {
                  sendNotification(res.reason)
                }
              })

            },
            icon: () => h(Delete, { name: 'users' }),
            condition: () => props.isLastEmail,
          }
        ]">
          <Button icon="more-horizontal" class="text-gray-600" variant="ghost" />
        </Dropdown>
      </div>
    </div>
    <!-- <div class="text-sm leading-5 text-gray-600">
      {{ subject }}
    </div> -->
    <div class="mb-3 text-sm leading-5 text-gray-600">
      <span v-if="to" class="text-2xs mr-1 font-bold text-gray-500">TO:</span>
      <span v-if="to"> {{ to }} </span>
      <span v-if="cc">, </span>
      <span v-if="cc" class="text-2xs mr-1 font-bold text-gray-500"> CC: </span>
      <span v-if="cc">{{ cc }}</span>
      <span v-if="bcc">, </span>
      <span v-if="bcc" class="text-2xs mr-1 font-bold text-gray-500">
        BCC:
      </span>
      <span v-if="bcc">{{ bcc }}</span>
    </div>
    <EmailContent :content="content" />
    <div class="flex flex-wrap gap-2">
      <AttachmentItem v-for="a in attachments" :key="a.file_url" :label="a.file_name" :url="a.file_url" />
    </div>
  </div>
  <TicketSplitModal v-model="showSplitModal" :ticket_id="name" :communication_id="name" />
</template>

<script setup lang="ts">
import { ref, PropType, h } from "vue";
import { AttachmentItem } from "@/components";
import { dateFormat, timeAgo, dateTooltipFormat, createToast } from "@/utils";
import { ReplyIcon, ReplyAllIcon } from "./icons";
import LucideSplit from "~icons/lucide/split";
import { useScreenSize } from "@/composables/screen";
import TicketSplitModal from "./ticket/TicketSplitModal.vue";
import { call } from "frappe-ui"
import Delete from './icons/Delete.vue'
import type { Resource, TabObject, TicketTab, View, Ticket, Activity } from "@/types";

interface Props {
  activity: Activity,
  showSplitOption: Boolean,
  isLastEmail: Boolean,
  ticket: Resource<Ticket>
}

const props = defineProps<Props>();

const { sender, to, cc, bcc, creation, subject, attachments, content, name } =
  props.activity;

const emit = defineEmits(["reply"]);

const { isMobileView } = useScreenSize();

const showSplitModal = ref(false);

async function deleteComm(comm_name: string, ticket_name: string) {
  const res = await call('etms_hd_addons.api.delete_replay', { comm_name, ticket_name })

  $dialog({
    title: "Confirm Action",
    message: `Are you sure you want delete this Email Replay (${props.ticket.data.subject})`,
    actions: [
      {
        label: "Create Related Non-SLA",
        theme: "green",
        variant: "solid",
        async onClick(close) {
         

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


  if (res.status == 200) {
    console.log(props.ticket);
    sendNotification(res.data)
    props.ticket.reload()
  } else {
    sendNotification(res.reason)
  }



}

function sendNotification(msg) {
  createToast({
    title: msg,
    icon: "info",
    iconClasses: "text-green-600",
  });
}

// TODO: Implement reply functionality using this way instead of emit drillup
// function reply(email, reply_all = false) {
//   emailBox.toggleEmailBox();
//   let editor = emailBox.editor;
//   let message = email.content;
//   let recipients = sender.name;
//   editor.toEmails = [email.sender];
//   editor.cc = editor.bcc = false;
//   editor.ccEmails = [];
//   editor.bccEmails = [];
//   console.log(recipients);

//   if (!email.subject.startsWith("Re:")) {
//     editor.subject = `Re: ${email.subject}`;
//   } else {
//     editor.subject = email.subject;
//   }

//   if (reply_all) {
//     let cc = email.cc?.split(",").map((r) => r.trim());
//     let bcc = email.bcc?.split(",").map((r) => r.trim());

//     if (cc?.length) {
//       recipients = recipients.filter((r) => !cc?.includes(r));
//       cc.push(...recipients);
//     } else {
//       cc = recipients;
//     }

//     editor.cc = cc ? true : false;
//     editor.bcc = bcc ? true : false;

//     editor.ccEmails = cc;
//     editor.bccEmails = bcc;
//   }

//   let repliedMessage = `<blockquote>${message}</blockquote>`;

//   editor.editor
//     .chain()
//     .clearContent()
//     .insertContent("<p>.</p>")
//     .updateAttributes("paragraph", { class: "reply-to-content" })
//     .insertContent(repliedMessage)
//     .focus("all")
//     .insertContentAt(0, { type: "paragraph" })
//     .focus("start")
//     .run();
// }
</script>

<style>
.email-content {
  max-width: 100%;
}

.email-content>* {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}
</style>
