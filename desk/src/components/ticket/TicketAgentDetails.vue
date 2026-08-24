<template>
  <div class="flex flex-col gap-3 border-b px-6 py-3">
    <div v-for="s in sections" :key="s.label" class="flex items-center text-base leading-5">
      <Tooltip :text="s.label">
        <div class="w-[126px] shrink-0 text-sm text-gray-600">{{ s.label }}</div>
      </Tooltip>
      <div class="flex items-center justify-between">
        <div v-if="s.value">{{ s.value }}</div>
        <Tooltip :text="s.tooltipValue">
          <Badge v-if="s.badgeText" class="-ml-1" :label="s.badgeText" variant="subtle" :theme="s.badgeColor" />
        </Tooltip>
      </div>
    </div>

    <div v-if="props.ticket.ehda_etms_erp_site" @click="openSiteTab" class="flex items-center text-base leading-5 cursor-pointer hover:opacity-80">
      <Tooltip text="Site">
        <div class="w-[126px] shrink-0 text-sm text-gray-600">Site</div>
      </Tooltip>
      <div class="flex items-center justify-between min-w-0">
        <Tooltip text="Open Site in New Tab">
          <p class="flex items-center truncate text-sm sm:text-base">
            <span class="truncate">{{ props.ticket.ehda_etms_erp_site }}</span>
            <svg
              class="inline-block w-4 h-4 ml-1 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                <circle cx="12" cy="12" r="10" />
                <ellipse cx="12" cy="12" rx="4" ry="10" />
                <path d="M2 12h20" />
              </g>
            </svg>
          </p>
        </Tooltip>
      </div>
    </div>

    <div v-if="props.ticket.customer" class="flex items-center text-base leading-5">
      <Tooltip text="Customer">
        <div class="w-[126px] shrink-0 text-sm text-gray-600">Customer</div>
      </Tooltip>
      <div class="flex items-center justify-between min-w-0">
        <p class="truncate text-sm sm:text-base">{{ props.ticket.customer }}</p>
      </div>
    </div>

    <div v-if="props.ticket.last_replay_by" class="flex items-center text-base leading-5">
      <Tooltip text="Last Reply By">
        <div class="w-[126px] shrink-0 text-sm text-gray-600">Last Reply By</div>
      </Tooltip>
      <div class="flex items-center justify-between min-w-0">
        <p class="truncate text-sm sm:text-base">{{ props.ticket.last_replay_by }}</p>
      </div>
    </div>

    <div v-if="props.ticket.sla" class="flex items-center text-base leading-5 cursor-pointer hover:opacity-80" @click="readSlaDescription">
      <Tooltip text="Related SLA">
        <div class="w-[126px] shrink-0 text-sm text-gray-600">Related SLA</div>
      </Tooltip>
      <div class="flex items-center justify-between min-w-0">
        <Tooltip text="Read SLA Description">
          <p class="flex items-center truncate text-sm sm:text-base text-blue-600 dark:text-blue-400">
            <span class="truncate">{{ props.ticket.sla }}</span>
            <svg class="inline-block w-4 h-4 ml-1 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5">
                <path stroke-linejoin="round" d="M21 3h-6m6 0l-9 9m9-9v6" />
                <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
              </g>
            </svg>
          </p>
        </Tooltip>
      </div>
    </div>

    <div v-if="props.ticket.ehda_non_sla_form" class="flex items-center text-base leading-5">
      <Tooltip text="Non SLA Status">
        <div class="w-[126px] shrink-0 text-sm text-gray-600">Non SLA Status</div>
      </Tooltip>
      <div class="flex items-center justify-between min-w-0">
        <p class="truncate text-sm sm:text-base">{{ props.ticket.ehda_non_sla_status }}</p>
      </div>
    </div>

    <div v-if="props.ticket.ehda_non_sla_form" class="flex items-center text-base leading-5 cursor-pointer hover:opacity-80" @click="readNonSlaDetails">
      <Tooltip text="Non SLA Form">
        <div class="w-[126px] shrink-0 text-sm text-gray-600">Non SLA Form</div>
      </Tooltip>
      <div class="flex items-center justify-between min-w-0">
        <Tooltip text="View Non-SLA Request Evaluation">
          <span class="flex items-center truncate text-sm sm:text-base text-blue-600 dark:text-blue-400">
            <span class="truncate">{{ props.ticket.ehda_non_sla_form }}</span>
            <svg class="inline-block w-4 h-4 ml-1 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5">
                <path stroke-linejoin="round" d="M21 3h-6m6 0l-9 9m9-9v6" />
                <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
              </g>
            </svg>
          </span>
        </Tooltip>
      </div>
    </div>

    <div v-if="props.ticket.ehda_non_sla_form_project" class="flex items-center text-base leading-5">
      <Tooltip text="Non SLA Project">
        <div class="w-[126px] shrink-0 text-sm text-gray-600">Non SLA Project</div>
      </Tooltip>
      <div class="flex items-center justify-between min-w-0">
        <p class="truncate text-sm sm:text-base">{{ props.ticket.ehda_non_sla_form_project }}</p>
      </div>
    </div>

    <!-- Non-SLA Evaluation Form Dialog -->
    <Dialog v-model="readNonSlaDetailsDialog" :options="{ size: '4xl' }">
      <template #body-title>
        <h3 class="text-base sm:text-lg font-semibold text-ink-gray-9">
          Non-SLA Request Evaluation Form ({{ props.ticket.ehda_non_sla_form }})
        </h3>
      </template>
      <template #body-content>
        <div v-if="nonSlaEvalForm" class="max-h-[65vh] sm:max-h-[70vh] overflow-y-auto pr-1 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input :modelValue="nonSlaEvalForm.workflow_state" label="Workflow Status" type="text" disabled />

            <Input :modelValue="nonSlaEvalForm.related_quotation" label="Related Quotation (if paid)" disabled />

            <div class="hidden sm:block"></div>

            <Input :modelValue="nonSlaEvalForm.related_project" label="Related Project (if approved)" disabled />

            <Input :modelValue="nonSlaEvalForm.employee" label="Assigned Evaluator" disabled />

            <Tooltip :text="(nonSlaEvalForm.type_of_non_sla_request || []).map(el => el.type_of_non_sla_request).join(', ')">
              <Input :modelValue="(nonSlaEvalForm.type_of_non_sla_request || []).map(el => el.type_of_non_sla_request).join(', ')"
                label="Type of Non SLA Request" disabled />
            </Tooltip>

            <Input :modelValue="nonSlaEvalForm.assigned_evaluator_name" label="Assigned Evaluator Name" disabled />

            <div class="sm:col-span-2 space-y-1" v-if="nonSlaEvalForm.meeting_with_customer_details_if_any">
              <label class="text-xs text-ink-gray-5">Meeting with Customer Details (if any)</label>
              <Textarea :variant="'subtle'" size="sm" placeholder=""
                :modelValue="nonSlaEvalForm.meeting_with_customer_details_if_any" disabled />
            </div>

            <Input :modelValue="nonSlaEvalForm.impact_scope" label="Impact Scope" disabled />

            <Input :modelValue="nonSlaEvalForm.technical_complexity" label="Technical Complexity" disabled />

            <Input :modelValue="nonSlaEvalForm.urgency_from_customer" label="Urgency from Customer" disabled />

            <Input :modelValue="nonSlaEvalForm.estimated_effort_in_hours" label="Estimated Effort (in hours)" disabled />

            <Tooltip v-if="nonSlaEvalForm.cancellation_reason?.length" :text="nonSlaEvalForm.cancellation_reason.map(el => el.link_afkn).join(', ')">
              <Input :modelValue="nonSlaEvalForm.cancellation_reason.map(el => el.link_afkn).join(', ')"
                label="Request Cancellation Reason" disabled />
            </Tooltip>

            <Tooltip v-if="nonSlaEvalForm.quotation_rejection_reason?.length" :text="nonSlaEvalForm.quotation_rejection_reason.map(el => el.link_kyjp).join(', ')">
              <Input :modelValue="nonSlaEvalForm.quotation_rejection_reason.map(el => el.link_kyjp).join(', ')"
                label="Quotation Rejection Reason" disabled />
            </Tooltip>
          </div>

          <div class="space-y-1" v-if="nonSlaEvalForm.additional_notes">
            <label class="text-xs text-ink-gray-5">Additional Notes</label>
            <Textarea :variant="'subtle'" size="sm" placeholder=""
              :modelValue="nonSlaEvalForm.additional_notes" disabled />
          </div>
        </div>
      </template>

      <template #actions>
        <div class="flex justify-end w-full">
          <Button variant="solid" @click="readNonSlaDetailsDialog = false">
            Close
          </Button>
        </div>
      </template>
    </Dialog>

    <!-- SLA Description Dialog -->
    <Dialog v-model="readSlaDetailsDialog" :options="{ size: 'xl' }">
      <template #body-title>
        <h3 class="text-base sm:text-lg font-semibold text-ink-gray-9">
          Service Level Agreement ({{ props.ticket.sla }})
        </h3>
      </template>
      <template #body-content>
        <div class="max-h-[60vh] overflow-y-auto pr-1 text-sm text-ink-gray-7 leading-relaxed" style="direction: rtl;">
          <div v-if="props.ticket.sla_description" v-html="props.ticket.sla_description" />
          <p v-else class="text-gray-400">No SLA description available.</p>
        </div>
      </template>
      <template #actions>
        <div class="flex justify-end w-full">
          <Button variant="solid" @click="readSlaDetailsDialog = false">
            Close
          </Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Badge, Tooltip, Dialog, Input, Textarea, Button, call } from "frappe-ui";
import { dayjs } from "@/dayjs";
import { formatTime, StatusEnum } from "@/utils";
import { dateFormat, dateTooltipFormat } from "@/utils";
import { computed, ref } from "vue";
import { NonSLAEvalForm } from "@/types";

const props = defineProps({
  ticket: {
    type: Object,
    required: true,
  },
});

let nonSlaEvalForm = ref<NonSLAEvalForm>();
let readNonSlaDetailsDialog = ref(false);
let readSlaDetailsDialog = ref(false);

function openSiteTab() {
  if (props.ticket.ehda_etms_erp_site) {
    open(`/app/etms-erp-site/${props.ticket.ehda_etms_erp_site}`, '_blank')?.focus();
  }
}

function readNonSlaDetails() {
  call("helpdesk.api.doc.get_non_sla_doc", {
    ticket_name: props.ticket.name,
    non_sla_name: props.ticket.ehda_non_sla_form
  }).then((res: NonSLAEvalForm) => {
    if (res) {
      nonSlaEvalForm.value = res;
      readNonSlaDetailsDialog.value = true;
    }
  });
}

function readSlaDescription() {
  readSlaDetailsDialog.value = true;
}

const firstResponseBadge = computed(() => {
  let firstResponse = null;
  if (
    !props.ticket.first_responded_on &&
    dayjs().isBefore(dayjs(props.ticket.response_by))
  ) {
    firstResponse = {
      label: `Due in ${formatTime(
        dayjs(props.ticket.response_by).diff(dayjs(), "s")
      )}`,
      color: "orange",
    };
  } else if (
    dayjs(props.ticket.first_responded_on).isBefore(
      dayjs(props.ticket.response_by)
    )
  ) {
    firstResponse = {
      label: `Fulfilled in ${formatTime(
        dayjs(props.ticket.first_responded_on).diff(
          dayjs(props.ticket.creation),
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
});

const resolutionBadge = computed(() => {
  let resolution = null;
  if ([StatusEnum.awaitingCustomerInfo, StatusEnum.nonSlaEval].includes(props.ticket.status)
    && props.ticket.on_hold_since && dayjs(props.ticket.resolution_by).isAfter(dayjs(props.ticket.on_hold_since))
  ) {
    let time_left = formatTime(
      dayjs(props.ticket.resolution_by).diff(
        dayjs(props.ticket.on_hold_since),
        "s"
      )
    );
    resolution = {
      label: `${time_left} left (On Hold)`,
      color: "blue",
    };
  } else if (
    !props.ticket.resolution_date &&
    dayjs().isBefore(props.ticket.resolution_by)
  ) {
    resolution = {
      label: `Due in ${formatTime(
        dayjs(props.ticket.resolution_by).diff(dayjs(), "s")
      )}`,
      color: "orange",
    };
  } else if (
    dayjs(props.ticket.resolution_date).isBefore(props.ticket.resolution_by)
  ) {
    resolution = {
      label: `Fulfilled in ${formatTime(
        dayjs(props.ticket.resolution_date).diff(
          dayjs(props.ticket.creation),
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
});

const sections = computed(() => [
  {
    label: "First Response",
    tooltipValue: dateFormat(
      props.ticket.first_responded_on || props.ticket.response_by,
      dateTooltipFormat
    ),
    badgeText: firstResponseBadge.value.label,
    badgeColor: firstResponseBadge.value.color,
  },
  {
    label: "Resolution",
    tooltipValue: dateFormat(
      props.ticket.resolution_date || props.ticket.resolution_by,
      dateTooltipFormat
    ),
    badgeText: resolutionBadge.value.label,
    badgeColor: resolutionBadge.value.color,
  },
  {
    label: "Source",
    value: props.ticket.via_customer_portal ? "Portal" : "Mail",
  },
]);
</script>
