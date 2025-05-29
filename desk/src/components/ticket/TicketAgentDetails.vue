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


    <Dialog v-model="readNonSlaDetailsDialog">
      <template #body-title>
        <h3>{{ ticket.ehda_non_sla_form }}</h3>
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

          <Input :modelValue="nonSlaEvalForm.assigned_evaluator_email" label="Assigned Evaluator Email" disabled />

          <!-- ----- -->

          <Input :modelValue="nonSlaEvalForm.impact_scope" label="Impact Scope" disabled />

          <Input :modelValue="nonSlaEvalForm.technical_complexity" label="Technical Complexity" disabled />


          <!-- ----- -->

          <Input :modelValue="nonSlaEvalForm.urgency_from_customer" label="Urgency from Customer" disabled />

          <Input :modelValue="nonSlaEvalForm.can_it_be_reused" label="Can it be reused ?" disabled />
        </div>
        
        <br>
        <div class="grid grid-cols-1">
          <p style="color: gray;">Additional Notes</p>
          <Textarea :variant="'subtle'" :ref_for="true" size="sm" placeholder="Placeholder"
            :modelValue="nonSlaEvalForm.additional_notes" disabled />
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

let nonSlaEvalForm = ref<NonSLAEvalForm>()
let readNonSlaDetailsDialog = ref(false)

function readNonSlaDetails() {
  call("helpdesk.api.doc.get_non_sla_doc", {
    ticket_name: props.ticket.name,
    non_sla_name: props.ticket.ehda_non_sla_form
  }).then((res: NonSLAEvalForm) => {
    // if (res.status == 200) {
    nonSlaEvalForm.value = res
    readNonSlaDetailsDialog.value = true
    console.log(res);

    // }
  }).finally((er) => {
    // $(document.body).css("filter", "opacity(1)")
  })
}

function readSlaDescription() {
  $dialog({
    title: `SLA Description (${props.ticket.sla})`,
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
  if (props.ticket.status === StatusEnum.awaitingCustomerInfo && props.ticket.on_hold_since &&
    dayjs(props.ticket.resolution_by).isAfter(dayjs(props.ticket.on_hold_since))
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
