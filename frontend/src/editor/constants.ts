import {
  CalendarDays,
  Heart,
  ImagePlus,
  Palette,
  Send,
  Users,
} from "lucide-react";
import type { InvitePalette } from "@/lib/invite-theme";

export const maxImageUploadBytes = 8 * 1024 * 1024;
export const imageUploadTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const editorStepIds = [
  "content",
  "schedule",
  "guests",
  "media",
  "design",
  "publish",
] as const;

export const editorSteps = [
  {
    title: "Содержание",
    description: "Пара, дата и место",
    icon: Heart,
  },
  {
    title: "Программа",
    description: "Расписание и дресс-код",
    icon: CalendarDays,
  },
  {
    title: "Гости",
    description: "Анкета подтверждения",
    icon: Users,
  },
  {
    title: "Медиа",
    description: "Фотографии и музыка",
    icon: ImagePlus,
  },
  {
    title: "Дизайн",
    description: "Шаблон и палитра",
    icon: Palette,
  },
  {
    title: "Публикация",
    description: "Проверка и запуск",
    icon: Send,
  },
] as const;

export const themeFields: Array<{
  field: keyof Pick<
    InvitePalette,
    "background" | "surface" | "ink" | "muted" | "photoText" | "accent" | "line"
  >;
  label: string;
  description: string;
}> = [
  { field: "background", label: "Фон", description: "Основной цвет страницы" },
  { field: "surface", label: "Панели", description: "Секции и формы" },
  { field: "ink", label: "Основной текст", description: "Заголовки и важные детали" },
  { field: "muted", label: "Вторичный текст", description: "Подписи и пояснения" },
  { field: "photoText", label: "Текст на фото", description: "Текст поверх изображений" },
  { field: "accent", label: "Акцент", description: "Кнопки и выделения" },
  { field: "line", label: "Линии", description: "Границы и разделители" },
];
