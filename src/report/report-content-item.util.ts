import { TaskInputDto, NextWeekTaskInputDto, HighlightInputDto, HoursInputDto } from './dto/report-content-item.dto.js';

export function pickTaskData(item: TaskInputDto) {
  return {
    name: item.name,
    priorityTypeId: item.priorityTypeId,
    taskStatusId: item.taskStatusId,
    planned: item.planned,
    actual: item.actual,
    plannedHour: item.plannedHour,
    actualHour: item.actualHour,
    deliverable: item.deliverable,
  };
}

export function pickNextWeekTaskData(item: NextWeekTaskInputDto) {
  return {
    description: item.description,
  };
}

export function pickHighlightData(item: HighlightInputDto) {
  return {
    reportHighlightTypeId: item.reportHighlightTypeId,
    isKey: item.isKey,
    description: item.description,
  };
}

export function pickHoursData(item: HoursInputDto) {
  return {
    reportHourTypeId: item.reportHourTypeId,
    hours: item.hours,
  };
}
