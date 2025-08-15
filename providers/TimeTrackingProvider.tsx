import createContextHook from "@nkzw/create-context-hook";
import { useMemo } from "react";
import { useDayEntries } from "./DayEntriesProvider";

export const [TimeTrackingProvider, useTimeTracking] = createContextHook(() => {
  const { onStamp } = useDayEntries();

  return useMemo(() => ({
    onStamp,
  }), [onStamp]);
});