import { ReactNode } from "react";
import { Button } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useGetOneData from "hooks/useGetOneData";
import EduSemestr from "pages/edu_semestr";
import checkPermission from "utils/check_permission";
import { IEduPlan } from "models/education";
import { StatusBadge } from "components/StatusTag";
import DeleteData from "components/deleteData";
import dayjs from "dayjs";
import useBreadCrumb from "hooks/useBreadCrumb";
import ViewInput from "components/ViewInput";

interface DataType {
  name: string;
  value: ReactNode;
}

const EduPlanView = () => {

  const { t } = useTranslation();
  const navigate = useNavigate()
  const { id } = useParams()

  const { data } = useGetOneData<IEduPlan>({
    queryKey: ['edu-plans', id],
    url: `edu-plans/${id}?expand=createdBy,updatedBy,description,eduYear,faculty,eduType,direction,eduSemestrs,eduForm`,
    options: {
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: (!!id && id != '0'),
    }
  })

  const tableData: DataType[] = [
    {
      name: t("Name"),
      value: data?.data?.name
    },
    {
      name: t("Description"),
      value: data?.data?.description,
    },
    {
      name: t("Edu year"),
      value: data?.data?.eduYear?.name,
    },
    {
      name: t("Faculty"),
      value: data?.data?.faculty?.name,
    },
    {
      name: t("Direction"),
      value: data?.data?.direction?.name,
    },
    {
      name: t("Edu type"),
      value: data?.data?.eduType?.name,
    },
    {
      name: t("Course duration"),
      value: data?.data?.course,
    },
    {
      name: t("Semestr duration"),
      value: data?.data?.course ? data?.data?.course * 2 : "--",
    },
    {
      name: t("Autumn semester"),
      value: data?.data?.first_start + " - " + data?.data?.first_end,
    },
    {
      name: t("Spring semester"),
      value: data?.data?.second_start + " - " + data?.data?.second_end,
    },
    {
      name: t("Edu form"),
      value: data?.data?.eduForm?.name,
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
            {data?.data?.created_at ? dayjs.unix(data?.data?.created_at).format("MM-DD-YYYY hh:mm:ss a") : null}
          </time>
        </div>
      ),
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
            {data?.data?.updated_at ? dayjs.unix(data?.data?.updated_at).format("MM-DD-YYYY hh:mm:ss a") : null}
          </time>
        </div>
      ),
    }
  ];

  useBreadCrumb({
    pageTitle: data?.data?.name ? data?.data?.name : t("Edu plan view"), 
    breadcrumb: [
      { name: "Home", path: '/' },
      { name: "Edu plans", path: '/edu-plans' },
      { name: data?.data?.name ? data?.data?.name : t("Edu plan view"), path: '/edu-plans' }
    ]})

  return (
    <div>
      <div className="content-card">
        <div className="flex justify-end mb-3">
          <DeleteData
            permission={"edu-plan_delete"}
            refetch={() => { }}
            url={"edu-plans"}
            id={Number(data?.data?.id)}
            navigateUrl="/edu-plans"
          >
            <Button danger>{t("Delete")}</Button>
          </DeleteData>
          {checkPermission("edu-plan_update") ? <Button onClick={() => navigate(`/edu-plans/update/${data?.data?.id}`)} className="ml-3">{t("Edit")}</Button> : ""}

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

      {checkPermission("edu-semestr_view") ? <EduSemestr /> : ""}
    </div>
  )
}
export default EduPlanView;