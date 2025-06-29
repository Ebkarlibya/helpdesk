<template>
  <div class="flex flex-col overflow-y-auto">
    <LayoutHeader>
      <template #left-header>
        <Breadcrumbs :items="breadcrumbs" />
      </template>
      <template #right-header>
        <CustomActions v-if="template.data?._customActions" :actions="template.data?._customActions" />
      </template>
    </LayoutHeader>
    <!-- Container -->
    <div class="flex flex-col gap-5 py-6 h-full flex-1 self-center overflow-auto mx-auto w-full max-w-4xl px-5">
      <!-- custom fields descriptions -->
      <div v-if="Boolean(template.data?.about)" class="">
        <div class="prose-f" v-html="sanitize(template.data.about)" />
      </div>
      <!-- custom fields -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3" style="align-items: end;" v-if="Boolean(visibleFields)">
        <UniInput v-for="field in visibleFields" :key="field.fieldname" :field="field"
          :value="templateFields[field.fieldname]" @change="
            (e) => handleOnFieldChange(e, field.fieldname, field.fieldtype)
          " />
        <Button @click="readSlaDescription" v-if="customerSlaInfo" class="h-8" style="width: fit-content;">
          <span>{{ customerSlaInfo.name }} 📃</span>
        </Button>
      </div>
      <!-- existing fields -->
      <div class="flex flex-col" :class="(subject.length >= 2 || description.length) && 'gap-5'">
        <div class="flex flex-col gap-2">
          <span class="block text-sm text-gray-700">
            Subject
            <span class="place-self-center text-red-500"> * </span>
          </span>
          <FormControl v-model="subject" type="text" placeholder="A short description" />
        </div>
        <SearchArticles v-if="isCustomerPortal" :query="subject" class="shadow" />
        <div v-if="isCustomerPortal">
          <h4 v-show="subject.length <= 2 && description.length === 0" class="text-p-sm text-gray-500 ml-1">
            Please enter a subject to continue
          </h4>
          <TicketTextEditor v-show="subject.length > 2 || description.length > 0" ref="editor"
            v-model:attachments="attachments" v-model:content="description" placeholder="Detailed explanation" expand>
            <template #bottom-right>
              <Button label="Submit" theme="gray" variant="solid" :disabled="$refs.editor.editor.isEmpty || ticket.loading || !subject
                " @click="() => ticket.submit()" />
            </template>
          </TicketTextEditor>
        </div>
      </div>

      <!-- for agent portal -->
      <div v-if="!isCustomerPortal">
        <TicketTextEditor ref="editor" v-model:attachments="attachments" v-model:content="description"
          placeholder="Detailed explanation" expand>
          <template #bottom-right>
            <Button label="Submit" theme="gray" variant="solid" :disabled="$refs.editor.editor.isEmpty || ticket.loading || !subject
              " @click="() => ticket.submit()" />
          </template>
        </TicketTextEditor>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  createResource,
  usePageMeta,
  Button,
  FormControl,
  Breadcrumbs, call
} from "frappe-ui";
import { globalStore } from "@/stores/globalStore";
import sanitizeHtml from "sanitize-html";
import { isEmpty } from "lodash";
import {
  setupCustomizations,
  handleSelectFieldUpdate,
  handleLinkFieldUpdate,
  parseField,
} from "@/composables/formCustomisation";
import { LayoutHeader, UniInput } from "@/components";
import SearchArticles from "../../components/SearchArticles.vue";
import TicketTextEditor from "./TicketTextEditor.vue";
import { useAuthStore } from "@/stores/auth";
import { capture } from "@/telemetry";
import { isCustomerPortal } from "@/utils";
import { Field } from "@/types";

interface P {
  templateId?: string;
}

interface Sla {
  name: string
  description: string
}

const props = withDefaults(defineProps<P>(), {
  templateId: "",
});

const route = useRoute();
const router = useRouter();
const { $dialog } = globalStore();

const subject = ref("");
const description = ref("");
const attachments = ref([]);
const templateFields = reactive({});
let customerSlaInfo = ref<Sla>()

const template = createResource({
  url: "helpdesk.helpdesk.doctype.hd_ticket_template.api.get_one",
  makeParams: () => ({
    name: props.templateId || "Default",
  }),
  auto: true,
  onSuccess: (data) => {
    description.value = data.description_template || "";
    oldFields = window.structuredClone(data.fields || []);
    setupCustomizations(template, {
      doc: templateFields,
      call,
      router,
      $dialog,
      applyFilters,
    });
    setupTemplateFields(data.fields);
  },
});

function setupTemplateFields(fields) {
  fields.forEach((field: Field) => {
    templateFields[field.fieldname] = "";
  });
}

let oldFields = [];

function applyFilters(fieldname: string, filters: any = null) {
  const f: Field = template.data.fields.find((f) => f.fieldname === fieldname);
  if (!f) return;
  if (f.fieldtype === "Select") {
    handleSelectFieldUpdate(f, fieldname, filters, templateFields, oldFields);
  } else if (f.fieldtype === "Link") {
    handleLinkFieldUpdate(f, fieldname, filters, templateFields, oldFields);
  }
}

const customOnChange = computed(() => template.data?._customOnChange);

const visibleFields = computed(() => {
  let _fields = template.data?.fields?.filter(
    (f) => route.meta.agent || !f.hide_from_customer
  );
  if (!_fields) return [];
  return _fields.map((field) => parseField(field, templateFields));
});

function getSiteCustomerSLA(siteName: string) {

  if (!siteName) customerSlaInfo.value = null

  call("etms_hd_addons.api.get_etms_site_hd_sla_description", {
    site_name: siteName,
  }).then((res: any) => {
    if (res) {
      customerSlaInfo.value = res
      console.log(customerSlaInfo.value);
      
    }
  }).finally((er) => {
    // $(document.body).css("filter", "opacity(1)")
  })



}

function readSlaDescription() {
  $dialog({
    title: `Service Level Agreement (${customerSlaInfo.value.name})`,
    html: `<div style="direction: rtl">${customerSlaInfo.value.description}</div>`,
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

function handleOnFieldChange(e: any, fieldname: string, fieldtype: string) {
  templateFields[fieldname] = e.value;

  if (fieldname === "ehda_etms_erp_site") {
    getSiteCustomerSLA(e.value)
  }

  const fieldDependentFns = customOnChange.value?.[fieldname];
  if (fieldDependentFns) {
    fieldDependentFns.forEach((fn: Function) => {
      fn(e.value, fieldtype);
    });
  }
}

const ticket = createResource({
  url: "helpdesk.helpdesk.doctype.hd_ticket.api.new",
  debounce: 300,
  makeParams: () => ({
    doc: {
      description: description.value,
      subject: subject.value,
      template: props.templateId,
      ...templateFields,
    },
    attachments: attachments.value,
  }),
  validate: (params) => {
    const fields = visibleFields.value?.filter((f) => f.required) || [];
    const toVerify = [...fields, "subject", "description"];
    for (const field of toVerify) {
      if (isEmpty(params.doc[field.fieldname || field])) {
        return `${field.label || field} is required`;
      }
    }
  },
  onSuccess: (data) => {
    router.push({
      name: isCustomerPortal.value ? "TicketCustomer" : "TicketAgent",
      params: {
        ticketId: data.name,
      },
    });
    if (!isCustomerPortal.value) return;
    // only capture telemetry for customer portal
    capture("new_ticket_submitted", {
      data: {
        user: userID,
        ticketID: data.name,
        subject: subject.value,
        description: description.value,
        customFields: templateFields,
      },
    });
  },
});

function sanitize(html: string) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  });
}

const breadcrumbs = computed(() => {
  const items = [
    {
      label: "Tickets",
      route: {
        name: "TicketsCustomer",
      },
    },
    {
      label: "New Ticket",
      route: {
        name: "TicketNew",
      },
    },
  ];
  return items;
});

usePageMeta(() => ({
  title: "New Ticket",
}));

const { userId: userID } = useAuthStore();
onMounted(() => {
  capture("new_ticket_page", {
    data: {
      user: userID,
    },
  });
});
</script>
