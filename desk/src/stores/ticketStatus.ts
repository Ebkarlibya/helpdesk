import { computed, ref } from "vue";
import { defineStore } from "pinia";

export const useTicketStatusStore = defineStore("ticketStatus", () => {
  const detailedToStatusMap = ref({
    "New": "Open",
    "Under Review": "Open",
    "Awaiting Customer Info": "Replied",
    "Customer Responded": "Open",
    "Work in Progress": "Open",
    "Non-SLA – Transferred for Evaluation": "Replied",
    "Transferred to Project Tracker": "Resolved",
    "Resolved": "Resolved",
    "Closed": "Closed",
    "Cancelled": "Closed"
})
  const options = ref(["Open", "Replied", "Resolved", "Closed"]);
  const detailedOptions = ref([
    "New",
    "Under Review",
    "Awaiting Customer Info",
    "Customer Responded",
    "Work in Progress",
    "Non-SLA – Transferred for Evaluation",
    "Transferred to Project Tracker",
    "Resolved",
    "Closed",
    "Cancelled"
  ]);


  const dropdown = computed(() =>
    options.value.map((o) => ({
      label: o,
      value: o,
    }))
  );

  const detailedDropdown = computed(() =>
    options.value.map((o) => ({
      label: o,
      value: o,
    }))
  );

  const colorMap = {
    Open: "red",
    Replied: "blue",
    Resolved: "green",
    Closed: "gray",
  };

  const detailedColorMap = {
    "New": "red",
    "Under Review": "red",
    "Awaiting Customer Info": "blue",
    "Customer Responded": "red",
    "Work in Progress": "red",
    "Non-SLA – Transferred for Evaluation": "yellow",
    "Transferred to Project Tracker": "green",
    "Resolved": "green",
    "Closed": "gray",
    "Cancelled": "gray",
  };
  
  const detailedTextColorMap = {
    "New": "!text-red-600",
    "Under Review": "!text-red-600",
    "Awaiting Customer Info": "!text-blue-600",
    "Customer Responded": "!text-red-600",
    "Work in Progress": "!text-red-600",
    "Non-SLA – Transferred for Evaluation": "!text-yellow-600",
    "Transferred to Project Tracker": "!text-green-700",
    "Resolved": "!text-green-700",
    "Closed": "!text-gray-700",
    "Cancelled": "!text-gray-700",
  };

  const textColorMap = {
    Open: "!text-red-600",
    Replied: "!text-blue-600",
    "Awaiting Response": "!text-blue-600",
    Resolved: "!text-green-700",
    Closed: "!text-gray-700",
  };
  const stateActive = ["Open", "Replied"];
  const stateInactive = ["Resolved", "Closed"];


  function getStatusFromDetailed(detailedStatus: string) {
    return detailedToStatusMap.value[detailedStatus]
  }


  return {
    colorMap,
    detailedColorMap,
    dropdown,
    detailedDropdown,
    options,
    detailedOptions,
    stateActive,
    stateInactive,
    textColorMap,
    detailedTextColorMap,
    detailedToStatusMap,
    getStatusFromDetailed
  };
});
