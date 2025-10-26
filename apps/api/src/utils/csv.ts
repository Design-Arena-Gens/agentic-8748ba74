import { parse } from 'csv-parse/sync';

interface StudentCsvRow {
  firstName: string;
  lastName: string;
  email?: string;
  institutionId?: string;
}

export const parseStudentsCsv = (buffer: Buffer): StudentCsvRow[] => {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  return records.map((row: Record<string, string>) => ({
    firstName: row.firstName ?? row.first_name ?? row.FirstName ?? row['First Name'],
    lastName: row.lastName ?? row.last_name ?? row.LastName ?? row['Last Name'],
    email: row.email ?? row.Email,
    institutionId: row.institutionId ?? row.institution_id ?? row.InstitutionId ?? row['Institution Id']
  }));
};

export type { StudentCsvRow };
