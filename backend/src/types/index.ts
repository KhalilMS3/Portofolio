export type Project = {
   projectId: number;
   projectName: string;
   projectDesc: string;
   roles: string[];
   technologies: string[];
   projectUrl: string;
   publishedAt: string;
   public: boolean;
   status: string;
};

export type Success<T> = {
   success: true;
   data: T
}
export type Failure<T> = {
   success: false,
   error: {
      code: string,
      message: string,
   }
}
export type Result<T> =
   | Success<T>
   | Failure<T>

   // KHALIL du er ferdig med setup av DB og alt i backend, tabellene er 