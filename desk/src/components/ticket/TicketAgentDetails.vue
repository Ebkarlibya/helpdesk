<template>
  <div class="flex flex-col gap-3 border-b px-6 py-3">
    <div v-for="s in sections" :key="s.label" class="flex items-center text-base leading-5">
      <Tooltip :text="s.label">
        <div class="w-[126px] text-sm text-gray-600">{{ s.label }}</div>
      </Tooltip>
      <div class="flex items-center justify-between">
        <div v-if="s.value">{{ s.value }}</div>
        <Tooltip :text="s.tooltipValue">
          <Badge v-if="s.badgeText" class="-ml-1" :label="s.badgeText" variant="subtle" :theme="s.badgeColor" />
        </Tooltip>
      </div>
    </div>

    <div v-if="props.ticket.ehda_etms_erp_site" @click="openSiteTab" class="flex items-center text-base leading-5">
      <Tooltip text="s.label">
        <div class="w-[126px] text-sm text-gray-600">Site</div>
      </Tooltip>
      <div class="flex items-center justify-between">
        <Tooltip text="Read SLA Description">
          <p style="cursor: pointer;">{{ props.ticket.ehda_etms_erp_site }}<span><span> 🌐</span></span></p>
        </Tooltip>
      </div>
    </div>

    <div v-if="props.ticket.customer" class="flex items-center text-base leading-5">
      <Tooltip text="s.label">
        <div class="w-[126px] text-sm text-gray-600">Customer</div>
      </Tooltip>
      <div class="flex items-center justify-between">
        <Tooltip text="Read SLA Description">
          <p style="cursor: pointer;">{{ props.ticket.customer }}<span></span></p>
        </Tooltip>
      </div>
    </div>

    <div v-if="props.ticket.last_replay_by" class="flex items-center text-base leading-5">
      <Tooltip text="s.label">
        <div class="w-[126px] text-sm text-gray-600">Last Replay By</div>
      </Tooltip>
      <div class="flex items-center justify-between">
        <Tooltip text="Last Replay By">
          <p style="cursor: pointer;">{{ props.ticket.last_replay_by }}<span></span></p>
        </Tooltip>
      </div>
    </div>

    <div class="flex items-center text-base leading-5">
      <Tooltip text="s.label">
        <div class="w-[126px] text-sm text-gray-600">Related SLA</div>
      </Tooltip>
      <div class="flex items-center justify-between">
        <Tooltip text="Read SLA Description">
          <p @click="readSlaDescription" style="cursor: pointer;">{{ props.ticket.sla }}<span> 📃</span></p>
        </Tooltip>
      </div>
    </div>

    <div v-if="props.ticket.ehda_non_sla_form" class="flex items-center text-base leading-5">
      <Tooltip text="s.label">
        <div class="w-[126px] text-sm text-gray-600">Non SLA Status</div>
      </Tooltip>
      <div class="flex items-center justify-between">
        <Tooltip text="Read SLA Description">
          <p style="cursor: pointer;">{{ props.ticket.ehda_non_sla_status }}<span></span></p>
        </Tooltip>
      </div>
    </div>

    <div v-if="props.ticket.ehda_non_sla_form" class="flex items-center text-base leading-5">
      <Tooltip text="s.label">
        <div class="w-[126px] text-sm text-gray-600">Non SLA Form</div>
      </Tooltip>
      <div class="flex items-center justify-between">
        <Tooltip text="Read SLA Description">
          <span @click="readNonSlaDetails" class="text-base text-gray-800 flex-1" style="cursor: pointer;">{{
            props.ticket.ehda_non_sla_form }} <span> 📃</span></span>
        </Tooltip>
      </div>
    </div>

    <div v-if="props.ticket.ehda_non_sla_form_project" class="flex items-center text-base leading-5">
      <Tooltip text="s.label">
        <div class="w-[126px] text-sm text-gray-600">Non SLA Project</div>
      </Tooltip>
      <div class="flex items-center justify-between">
        <Tooltip text="Read SLA Description">
          <p style="cursor: pointer;">{{ props.ticket.ehda_non_sla_form_project }}<span></span></p>
        </Tooltip>
      </div>
    </div>

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

          <Input :modelValue="nonSlaEvalForm.employee" label="Assigned Evaluator" disabled />

          <Tooltip :text="nonSlaEvalForm.type_of_non_sla_request.map(el => el.type_of_non_sla_request).join(', ')">
            <Input :modelValue="nonSlaEvalForm.type_of_non_sla_request.map(el => el.type_of_non_sla_request).join(', ')"
              label="Type of Non SLA Request" disabled />
          </Tooltip>

          <!-- ----- -->

          <Input :modelValue="nonSlaEvalForm.assigned_evaluator_name" label="Assigned Evaluator Name" disabled />

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
  </div>
</template>

<script setup lang="ts">
import { Badge, Tooltip, call } from "frappe-ui";
import { dayjs } from "@/dayjs";
import { formatTime, StatusEnum } from "@/utils";
import { dateFormat, dateTooltipFormat } from "@/utils";
import { computed, ref } from "vue";
import { globalStore } from "@/stores/globalStore";
import { NonSLAEvalForm } from "@/types";
const { $dialog } = globalStore();

const props = defineProps({
  ticket: {
    type: Object,
    required: true,
  },
});
console.log(props.ticket);

let nonSlaEvalForm = ref<NonSLAEvalForm>()
let readNonSlaDetailsDialog = ref(false)

function openSiteTab() {
  open(`/app/etms-erp-site/${props.ticket.ehda_etms_erp_site}`, '_blank').focus()
}

function readNonSlaDetails() {
  call("helpdesk.api.doc.get_non_sla_doc", {
    ticket_name: props.ticket.name,
    non_sla_name: props.ticket.ehda_non_sla_form
  }).then((res: NonSLAEvalForm) => {
    if (res) {
      nonSlaEvalForm.value = res
      readNonSlaDetailsDialog.value = true
      console.log(res);

    } else {
      console.log('no customer linked to user: ');
    }
  }).finally((er) => {
    // $(document.body).css("filter", "opacity(1)")
  })
}

function readSlaDescription() {
  $dialog({
    title: `Service Level Agreement (${props.ticket.sla})`,
    html: `<div style="direction: rtl">${props.ticket.sla_description}</div>`,
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
