<template>
  <TextEditor ref="editorRef" :editor-class="[
    'prose-sm max-w-none mx-10 max-h-[50vh] overflow-y-auto py-3',
    'min-h-[7rem]',
    getFontFamily(newEmail),
  ]" :content="newEmail" :starterkit-options="{ heading: { levels: [2, 3, 4, 5, 6] } }" :placeholder="placeholder"
    :editable="editable" @change="editable ? (newEmail = $event) : null" :extensions="[PreserveVideoControls]">
    <template #top>
      <div class="mx-10 flex items-center gap-2 border-y py-2.5">
        <span class="text-xs text-gray-500">TO:</span>
        <MultiSelectInput v-model="toEmailsClone" class="flex-1" :validate="validateEmail"
          :error-message="(value) => `${value} is an invalid email address`" />
        <Button :label="'CC'" :class="[cc ? 'bg-gray-300 hover:bg-gray-200' : '']" @click="toggleCC()" />
        <Button :label="'BCC'" :class="[bcc ? 'bg-gray-300 hover:bg-gray-200' : '']" @click="toggleBCC()" />
      </div>
      <div v-if="showCC || cc" class="mx-10 flex items-center gap-2 py-2.5" :class="cc || showCC ? 'border-b' : ''">
        <span class="text-xs text-gray-500">CC:</span>
        <MultiSelectInput ref="ccInput" v-model="ccEmailsClone" class="flex-1" :validate="validateEmail"
          :error-message="(value) => `${value} is an invalid email address`" />
      </div>
      <div v-if="showBCC || bcc" class="mx-10 flex items-center gap-2 py-2.5" :class="bcc || showBCC ? 'border-b' : ''">
        <span class="text-xs text-gray-500">BCC:</span>
        <MultiSelectInput ref="bccInput" v-model="bccEmailsClone" class="flex-1" :validate="validateEmail"
          :error-message="(value) => `${value} is an invalid email address`" />
      </div>
    </template>
    <template #bottom>
      <div class="flex flex-wrap gap-2 px-10">
        <AttachmentItem v-for="a in attachments" :key="a.file_url" :label="a.file_name">
          <template #suffix>
            <FeatherIcon class="h-3.5" name="x" @click.stop="removeAttachment(a)" />
          </template>
        </AttachmentItem>
      </div>
      <div class="flex justify-between gap-2 overflow-hidden px-10 py-2.5">
        <div class="flex items-center overflow-x-auto">
          <TextEditorFixedMenu class="-ml-1" :buttons="textEditorMenuButtons" />
          <div class="flex gap-1">
            <FileUploader :upload-args="{
              doctype: doctype,
              docname: modelValue?.name,
              private: true,
            }" @success="
              (f) => {
                attachments.push(f);
              }
            ">
              <template #default="{ openFileSelector }">
                <Button variant="ghost" @click="openFileSelector()">
                  <template #icon>
                    <AttachmentIcon class="h-4" style="color: #000000; stroke-width: 1.5 !important" />
                  </template>
                </Button>
              </template>
            </FileUploader>
            <Button variant="ghost" @click="showCannedResponseSelectorModal = true">
              <template #icon>
                <EmailIcon class="h-4" style="color: #000000; stroke-width: 1.2" />
              </template>
            </Button>
          </div>
        </div>
        <div class="mt-2 flex items-center justify-end space-x-2 sm:mt-0">
          <Button label="Discard" @click="handleDiscard" />
          <Button variant="solid" :disabled="emailEmpty" :loading="sendMail.loading" label="Send" @click="
            () => {
              openSubmitMailDialog();
            }
          " />
          <Dialog v-model="nextStatusDialog">
            <template #body-title>
              <h3>Next Status Transition</h3>
            </template>
            <template #body-content>
              <Dropdown class="w-full" v-model="nextStatus" :options="statusOptions">
                <template #default="{ open }">
                  <Button :label="nextStatus">
                    <template #prefix>
                      <IndicatorIcon :class="ticketStatusStore.colorMap[nextStatus]" />
                    </template>
                    <template #suffix>
                      <FeatherIcon :name="open ? 'chevron-up' : 'chevron-down'" class="h-4" />
                    </template>
                  </Button>
                </template>
              </Dropdown>
            </template>
            <template #actions>
              <Button v-if="nextStatus == `Non-SLA – Transferred for Evaluation`" variant="solid"
                class="bg-red-50" @click="submitMail">
                Confirm & Create Non SLA!
              </Button>
              <Button v-else variant="solid" @click="submitMail">
                Confirm
              </Button>
              <Button class="ml-2" @click="nextStatusDialog = false">
                Close
              </Button>
            </template>
          </Dialog>
        </div>
      </div>
    </template>
  </TextEditor>
  <CannedResponseSelectorModal v-model="showCannedResponseSelectorModal" :doctype="doctype"
    @apply="applyCannedResponse" />
</template>

<script setup lang="ts">
import { ref, computed, nextTick, inject } from "vue";
import { useStorage } from "@vueuse/core";
import {
  FileUploader,
  TextEditor,
  TextEditorFixedMenu,
  createResource,
  call
} from "frappe-ui";
import {
  createToast,
  validateEmail,
  textEditorMenuButtons,
  isContentEmpty,
  getFontFamily,
StatusEnum,
} from "@/utils";
import {
  MultiSelectInput,
  AttachmentItem,
  CannedResponseSelectorModal,
} from "@/components";
import { AttachmentIcon, EmailIcon } from "@/components/icons";
import { PreserveVideoControls } from "@/tiptap-extensions";
import { useTicketStatusStore } from "@/stores/ticketStatus";
import { Ticket } from "@/types";

const ticketStatusStore = useTicketStatusStore();
const updateTicket = inject<Function>("updateTicket")

const editorRef = ref(null);
const showCannedResponseSelectorModal = ref(false);
const nextStatusDialog = ref(false)

const props = defineProps({
  placeholder: {
    type: String,
    default: null,
  },
  editable: {
    type: Boolean,
    default: true,
  },
  doctype: {
    type: String,
    default: "HD Ticket",
  },
  toEmails: {
    type: Array,
    default: () => [],
  },
  ccEmails: {
    type: Array,
    default: () => [],
  },
  bccEmails: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["submit", "discard"]);
const doc = defineModel<Ticket>();
console.log(doc);

const newEmail = useStorage("emailBoxContent" + doc.value.name, "");
const attachments = ref([]);
const emailEmpty = computed(() => {
  return isContentEmpty(newEmail.value);
});

const toEmailsClone = ref([...props.toEmails]);
const ccEmailsClone = ref([...props.ccEmails]);
const bccEmailsClone = ref([...props.bccEmails]);
const showCC = ref(false);
const showBCC = ref(false);
const cc = computed(() => (ccEmailsClone.value?.length ? true : false));
const bcc = computed(() => (bccEmailsClone.value?.length ? true : false));
const ccInput = ref(null);
const bccInput = ref(null);
const nextStatus = ref(doc.value.status)

function applyCannedResponse(template) {
  newEmail.value = template.message;
  showCannedResponseSelectorModal.value = false;
}

const statusOptions = computed(() =>
  ticketStatusStore.options.map((mappedStatus) => ({
    label: mappedStatus,
    value: mappedStatus,
    onClick: () => {
      if (mappedStatus == StatusEnum.transferredToProj) {
        createToast({ title: "Transition to this status only allowed from Non SLA Form Workflow", icon: "check", iconClasses: "text-red-600", });
        return
      }

      if ([StatusEnum.nonSlaEval, StatusEnum.transferredToProj].includes(doc.value.status)) {
        createToast({ title: "Cannot Change Ticket with Linked Non-SLA Form", icon: "check", iconClasses: "text-red-600", });
        return
      }



      nextStatus.value = mappedStatus
    },
  }))
);

function openSubmitMailDialog() {
  if (doc.value.status == StatusEnum.nonSlaEval) {
    submitMail()
    return
  }
  nextStatusDialog.value = true
}

const sendMail = createResource({
  url: "run_doc_method",
  makeParams: () => ({
    dt: props.doctype,
    dn: doc.value.name,
    method: "reply_via_agent",
    args: {
      attachments: attachments.value.map((x) => x.name),
      to: toEmailsClone.value.join(","),
      cc: ccEmailsClone.value?.join(","),
      bcc: bccEmailsClone.value?.join(","),
      message: newEmail.value,
    },
  }),
  onSuccess: () => {
    resetState();
    doc.value.status = nextStatus.value
    updateTicket({ status: doc.value.status })
    emit("submit");
  },
  debounce: 300,
});

function submitMail() {
  if (isContentEmpty(newEmail.value)) {
    return;
  }
  if (!toEmailsClone.value.length) {
    createToast({
      text: "Please enter a recipient email address",
      icon: "x",
      iconClasses: "text-red-600",
    });
    return;
  }

  sendMail.submit();
  nextStatusDialog.value = false
}

function toggleCC() {
  showCC.value = !showCC.value;

  showCC.value &&
    nextTick(() => {
      ccInput.value.setFocus();
    });
}

function toggleBCC() {
  showBCC.value = !showBCC.value;
  showBCC.value &&
    nextTick(() => {
      bccInput.value.setFocus();
    });
}

function removeAttachment(attachment) {
  attachments.value = attachments.value.filter((a) => a !== attachment);
}

function addToReply(
  body: string,
  toEmails: string[],
  ccEmails: string[],
  bccEmails: string[]
) {
  toEmailsClone.value = toEmails;
  ccEmailsClone.value = ccEmails;
  bccEmailsClone.value = bccEmails;
  editorRef.value.editor
    .chain()
    .clearContent()
    .insertContent(body)
    .focus("all")
    .setBlockquote()
    .insertContentAt(0, { type: "paragraph" })
    .focus("start")
    .run();
}

function resetState() {
  newEmail.value = null;
  attachments.value = [];
}

function handleDiscard() {
  attachments.value = [];
  newEmail.value = null;

  ccEmailsClone.value = [];
  bccEmailsClone.value = [];
  ccEmailsClone.value = [];
  showCC.value = false;
  showBCC.value = false;

  emit("discard");
}

const editor = computed(() => {
  return editorRef.value.editor;
});

defineExpose({
  addToReply,
  editor,
  submitMail,
});
</script>
