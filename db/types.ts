export interface CompanyEntity {
  id: String;
  name: String;
  description: String;
  jobs: JobEntity[];
}

export interface JobEntity {
  id: String;
  title: String;
  description?: String;
  company: CompanyEntity;
}

export interface UserEntity {
  id: String;
  name: String;
  email: String;
  companyId: String;
}
