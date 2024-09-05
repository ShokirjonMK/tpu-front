import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useGetOneData from "hooks/useGetOneData";
import dayjs from "dayjs";
import { useMutation } from "@tanstack/react-query";
import { delete_data } from "services";
import { Badge, Button, Popconfirm, Tooltip } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import SimpleCreateModal from "pages/common/crud/base_create";
import checkPermission from "utils/check_permission";
import HeaderExtraLayout from "components/HeaderPage/headerExtraLayout";
import DepartmentUpdate from "../crud/update";
import EmployeeIndexPage from "../components/employee_index";
import DeleteData from "components/deleteData";
import useBreadCrumb from "hooks/useBreadCrumb";
import ViewInput from "components/ViewInput";

interface DataType {
  name: string;
  value: ReactNode;
  value2?: ReactNode;
  value3?: ReactNode;
}

const ViewDepartment: React.FC = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [visibleCreate, setVisibleCreate] = useState<boolean>(false);
  const [departId, setId] = useState<number | undefined>();
  const [isOpenForm, setisOpenForm] = useState<boolean>(false);

  const { data, refetch, isLoading } = useGetOneData({
    queryKey: ["departments", id],
    url: `departments/${id}?expand=description,parent,createdBy,updatedBy,leader,types`,
    options: {
      refetchOnWindowFocus: false,
      retry: 0,
    },
  });

  const columns: ColumnsType<DataType> = [
    {
      title: t("Name"),
      dataIndex: "name",
      rowScope: "row",
    },
    {
      title: t("Value"),
      dataIndex: "value",
      onCell: (_, index) => ({
        colSpan: index === 3 || index === 5 ? 1 : 3,
      }),
    },
    {
      title: t("Name2"),
      dataIndex: "value2",
      onCell: (_, index) => ({
        colSpan: index === 3 || index === 5 ? 1 : 0,
        className: index === 3 || index === 5 ? 'bg-[#FAFAFA]' : ''
      }),
    },
    {
      title: t("Name3"),
      dataIndex: "value3",
      onCell: (_, index) => ({
        colSpan: index === 3 || index === 5 ? 1 : 0,
      }),
    },
  ];

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
      name: t("Head of department"),
      value: data?.data?.leader ? <div>{data?.data?.leader?.first_name} {data?.data?.leader?.last_name}</div> : null,
    },
    {
      name: t("Type"),
      value: data?.data?.types?.name,
    },
    {
      name: t("Parent"),
      value: data?.data?.parent_id ? data?.data?.parent?.name : null,
    },
    {
      name: t("Status"),
      value: (
        <Badge
          status={data?.data?.status === 0 ? 'error' : 'success'}
          text={data?.data?.status === 1 ? 'Active' : 'InActive'}
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
          <time>
            <span className="text-gray-400">{t("Date")}: </span>
            {dayjs.unix(data?.data?.updated_at).format("DD-MM-YYYY hh:mm:ss a")}
          </time>
        </div>
      )
    },
  ];

  useBreadCrumb({
    pageTitle: t(data?.data?.name), 
    breadcrumb: [
      { name: "Home", path: "/" },
      { name: "Department", path: "/structural-unit/department" },
      { name: "Department view", path: "" },
    ]
  })

  return (
    <div>
      <DepartmentUpdate
        id={departId}
        isOpenForm={isOpenForm}
        setisOpenForm={setisOpenForm}
        setId={setId}
        refetch={refetch}
      />

      {id ? (
        <SimpleCreateModal
          url="departments"
          visible={visibleCreate}
          setVisible={setVisibleCreate}
          refetch={refetch}
          title="Create users"
        />
      ) : null}

      <div className="content-card">

        <div className="flex justify-end mb-3">
          {checkPermission("department_delete") ? (
            <Tooltip placement="left" title={t("Delete")}>
              <DeleteData
                permission={"department_delete"}
                refetch={refetch}
                url={"departments"}
                id={Number(id)}
                className="mr-4"
                navigateUrl="/structural-unit/department"
              >
                <Button danger >
                  {t("Delete")}
                </Button>
              </DeleteData>
            </Tooltip>
          ) : null}

          {
            checkPermission("department_update") ? (
              <Button
            onClick={() => {
              setisOpenForm(true);
              setId(Number(id))
            }}
          >
            {t("Edit")}
          </Button>
            ) : null
          }
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
        <EmployeeIndexPage userAccessTypeId={3} />
      </div>
    </div>
  );
};

export default ViewDepartment;
