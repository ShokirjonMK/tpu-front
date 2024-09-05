import { ReactNode, useState } from "react";
import { Button } from "antd";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import useGetOneData from "hooks/useGetOneData";
import checkPermission from "utils/check_permission";
import { IEduSemestr } from "models/education";
import { StatusBadge } from "components/StatusTag";
import EduSemestrSubject from "pages/edu_semestr_subjects";
import UpdateEduSemestr from "./update";
import dayjs from "dayjs";
import useBreadCrumb from "hooks/useBreadCrumb";
import ViewInput from "components/ViewInput";

interface DataType {
  name: string;
  value: ReactNode;
}

const EduSemestrView = () => {

  const { t } = useTranslation();
  const { edu_semestr_id } = useParams()
  const [isOpenForm, setisOpenForm] = useState<boolean>(false);
  const [id, setId] = useState<number | undefined>();

  const { data, refetch, isFetching } = useGetOneData<IEduSemestr>({
    queryKey: ['edu-semestrs', edu_semestr_id],
    url: `edu-semestrs/${edu_semestr_id}?expand=createdBy,updatedBy,description,eduYear,eduType,eduPlan,semestr,course,eduSemestrSubjects,eduSemestrSubjects.subject,eduSemestrSubjects.subjectType`,
    options: {
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: (!!edu_semestr_id && edu_semestr_id != '0'),
    }
  })

  const tableData: DataType[] = [
    {
      name: t("Name"),
      value: data?.data?.name
    },
    {
      name: t("Semestr"),
      value: data?.data?.semestr?.name,
    },
    {
      name: t("Course"),
      value: data?.data?.course?.name,
    },
    {
      name: t("Edu year"),
      value: data?.data?.eduYear?.name,
    },
    {
      name: t("Edu plan"),
      value: data?.data?.eduPlan?.name,
    },
    {
      name: t("Start time"),
      value: data?.data?.start_date?.slice(0, 10),
    },
    {
      name: t("End time"),
      value: data?.data?.end_date?.slice(0, 10),
    },
    {
      name: t("Confirmation"),
      value: data?.data?.is_checked === 1 ? <p className="text-[#52C41A]">Tasdiqlangan</p> : <p className="text-[#ffc069]">Tasdiqlanmagan</p>,
    },
    {
      name: t("Status"),
      value: <StatusBadge status={data?.data?.status} />,
    },
    {
      name: t("CreatedBy"),
      value: (
        <div>
          <span className="text-gray-400">
            {t("name")}/{t("Last Name")}/{t("Role")} :{" "}
          </span>
          {data?.data?.createdBy?.first_name} {data?.data?.createdBy?.last_name}{" "}
          (
          {data?.data?.createdBy?.role.map((item: string) => {
            return item;
          })}
          )
          {/* <p>
            <span className="text-gray-400">{t("Login")}: </span>
            {data?.data?.createdBy?.username}
          </p> */}
          <time className="block">
            <span className="text-gray-400">{t("Date")}: </span>
            {/* {data?.data?.created_at} */}
            {data?.data?.created_at ? dayjs.unix(data?.data?.created_at).format("DD-MM-YYYY hh:mm:ss a") : "--"}
          </time>
        </div>
      )
    },
    {
      name: t("UpdateBy"),
      value: (
        <div>
          <span className="text-gray-400">
            {t("name")}/{t("Last Name")}/{t("Role")} :{" "}
          </span>
          {data?.data?.updatedBy?.first_name} {data?.data?.updatedBy?.last_name}{" "}
          (
          {data?.data?.updatedBy?.role.map((item: string) => {
            return item;
          })}
          )
          {/* <p>
            <span className="text-gray-400">{t("Login")}: </span>
            {data?.data?.updatedBy?.username}
          </p> */}
          <time className="block">
            <span className="text-gray-400">{t("Date")}: </span>
            {data?.data?.updated_at ? dayjs.unix(data?.data?.updated_at).format("DD-MM-YYYY hh:mm:ss a") : "--"}
          </time>
        </div>
      )
    }
  ];  

  useBreadCrumb({
    pageTitle: data?.data?.name ? data?.data?.name : t("Edu semestr view"), 
    breadcrumb: [
      { name: "Home", path: '/' },
      { name: "Edu plans", path: '/edu-plans' },
      { name: "Edu plan", path: `/edu-plans/view/${data?.data?.edu_plan_id}` },
      { name: data?.data?.name ? data?.data?.name : t("Edu semestr view"), path: '/edu-plans/semestrs' }
  ]})

  return (
    <div>
      <div className="px-[24px] py-[20px] content-card">
        <div className="flex justify-end mb-3">
          {checkPermission("edu-semestr_update") ? <Button onClick={() => { setisOpenForm(true); setId(Number(edu_semestr_id)) }} className="ml-3">{t("Edit")}</Button> : ""}
        </div>
        <div className="grid xl:grid-cols-4 grid-cols-2 gap-4">
          {
            tableData?.map((item, index) => (
              <ViewInput
                key={index}
                label={item?.name} 
                value={item?.value} 
                placeholder={item?.name}
              />
            ))
          }
        </div>
      </div>
        
      {checkPermission("edu-semestr-subject_view") ? <EduSemestrSubject eduSemestrs={data?.data} eduSemestrRefetch={refetch} isEduSemestrFetching={isFetching} /> : ""}

      <UpdateEduSemestr
        id={id}
        isOpenForm={isOpenForm}
        setId={setId}
        setisOpenForm={setisOpenForm}
        refetch={refetch}
      />
    </div>
  )
}
export default EduSemestrView;