export type Student = {
  id: string;
  name: string;
  grade: number | null;
  avatar: string | null;
  actionAt: Date;
  severityLabel?: string;
};
