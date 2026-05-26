function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number) {
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)
  const startTotalMinutes = startHours * 60 + startMinutes
  const endTotalMinutes = endHours * 60 + endMinutes
  const slots: string[] = []

  for (
    let currentMinutes = startTotalMinutes;
    currentMinutes <= endTotalMinutes;
    currentMinutes += intervalMinutes
  ) {
    slots.push(minutesToTime(currentMinutes))
  }

  return slots
}

export const reservationTimeOptions = generateTimeSlots('08:45', '20:45', 90)
