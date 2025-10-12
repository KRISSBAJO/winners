// src/api/features/events/pages/EventDetailAdminWrapper.tsx
import { useParams } from "react-router-dom";
import { EventDetailAdmin } from "./EventsManagement";

export default function EventDetailAdminWrapper() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <EventDetailAdmin id={id} />;
}
