import React, { ReactNode, useState } from "react";
import { Badge, Button, Tooltip } from "antd";
import dayjs from "dayjs";
import useGetOneData from "hooks/useGetOneData";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import checkPermission from "utils/check_permission";
import EmployeeIndexPage from "pages/department/components/employee_index";
import KafedraUpdate from "../crud/update";
import DeleteData from "components/deleteData";
import useBreadCrumb from "hooks/useBreadCrumb";
import ViewInput from "components/ViewInput";

interface DataType {
  name: string;
  value: ReactNode;
}

const ViewsKafedra: React.FC = (): JSX.Element => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [visibleEdit, setVisibleEdit] = useState<boolean>(false);
  const [_id, setId] = useState<number>();

  const { data, refetch, isLoading } = useGetOneData({
    queryKey: ["kafedras", id],
    url: `kafedras/${id}?expand=description,createdBy,updatedBy,faculty,direction,leader`,
    options: {
      refetchOnWindowFocus: false,
      retry: 0,
    },
  });

  const tableData: DataType[] = [
    {
      name: t("Name"),
      value: data?.data?.name,
    },
    {
      name: t("Description"),
      value: data?.data?.description,
    },
    {
      name: t("Faculty"),
      value: data?.data ? data?.data?.faculty?.name : null,
    },
    {
      name: t("Direction"),
      value: data?.data ? data?.data?.direction?.name : null,
    },
    {
      name: t("Head of kafedra"),
      value: data?.data?.leader ? (
        <span>
          {data?.data?.leader?.last_name} {data?.data?.leader?.first_name}
        </span>
      ) : null,
    },
    {
      name: t("Status"),
      value: (
        <Badge
          color={data?.data?.status === 1 ? "green" : "red"}
          text={data?.data?.status === 1 ? "Active" : "InActive"}
        />
      ),
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
          <time>
            <span className="text-gray-400">{t("Date")}: </span>
            {dayjs.unix(data?.data?.created_at).format("MM-DD-YYYY hh:mm:ss a")}
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
          <time>
            <span className="text-gray-400">{t("Date")}: </span>
            {dayjs.unix(data?.data?.updated_at).format("MM-DD-YYYY hh:mm:ss a")}
          </time>
        </div>
      ),
    },
  ];

  useBreadCrumb({
    pageTitle: t(`${data?.data?.name}`), 
    breadcrumb: [
      { name: "Home", path: "/" },
      { name: "Kafedra", path: "/structural-unit/kafedras" },
      { name: "Kafedra view", path: "" },
    ]
  })

  return (
    <div>

      {id ? (
        <KafedraUpdate
          id={data?.data?.id}
          isOpenForm={visibleEdit}
          setisOpenForm={setVisibleEdit}
          setId={setId}
          refetch={refetch}
        />
      ) : null}

      <div className="content-card">
        <div className="flex justify-end mb-3">
          {checkPermission("kafedra_delete") ? (
            <Tooltip placement="left" title={t("Delete")}>
              <DeleteData
                permission={"kafedra_delete"}
                refetch={refetch}
                url={"kafedras"}
                id={Number(id)}
                className="mr-4"
                navigateUrl="/structural-unit/kafedras"
              >
                <Button danger >
                  {t("Delete")}
                </Button>
              </DeleteData>
            </Tooltip>
          ) : null}
          {checkPermission("kafedra_update") ? (<Button onClick={() => setVisibleEdit(true)}>{t("Edit")}</Button>) : null}
        </div>

        <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
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

        <EmployeeIndexPage userAccessTypeId={2} />
      </div>
    </div>
  );
};

export default ViewsKafedra;
