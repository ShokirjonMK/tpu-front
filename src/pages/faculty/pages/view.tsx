import React, { ReactNode, useState } from "react";
import { Badge, Button, Tooltip } from "antd";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import useGetOneData from "hooks/useGetOneData";
import SimpleUpdateModal from "pages/common/crud/base_update";
import checkPermission from "utils/check_permission";
import SimpleCreateModal from "pages/common/crud/base_create";
import EmployeeIndexPage from "pages/department/components/employee_index";
import DeleteData from "components/deleteData";
import useBreadCrumb from "hooks/useBreadCrumb";
import ViewInput from "components/ViewInput";

interface DataType {
  name: string;
  value: ReactNode;
}

const FacultyView: React.FC = (): JSX.Element => {
  const { t } = useTranslation();
  const { id: _id } = useParams();
  const [visibleEdit, setVisibleEdit] = useState<boolean>(false);
  const [visibleCreate, setVisibleCreate] = useState<boolean>(false);

  const { data, refetch } = useGetOneData({
    queryKey: ["faculties", _id],
    url: `faculties/${_id}?expand=description,createdBy,updatedBy`,
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
            <span className="text-gray-400">Login: </span>
            {data?.data?.createdBy?.username}
          </p> */}
          <time className="block">
            <span className="text-gray-400">Sana: </span>
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
            <span className="text-gray-400">Login: </span>
            {data?.data?.updatedBy?.username}
          </p> */}
          <time className="block">
            <span className="text-gray-400">Sana: </span>
            {dayjs.unix(data?.data?.updated_at).format("MM-DD-YYYY hh:mm:ss a")}
          </time>
        </div>
      )
    },
  ];

  useBreadCrumb({
    pageTitle: t(`${data?.data?.name}`), 
    breadcrumb: [
      { name: "Home", path: "/" },
      { name: "Faculty", path: "/structural-unit/faculties" },
      { name: "Faculty view", path: "" },
    ]
  })

  return (
    <div>
        

      {_id ? (
        <SimpleUpdateModal
          id={data?.data?.id}
          url="faculties"
          visible={visibleEdit}
          setVisible={setVisibleEdit}
          refetch={refetch}
          title={data?.data?.name}
        />
      ) : null}

      {_id ? (
        <SimpleCreateModal
          url="faculties"
          visible={visibleCreate}
          setVisible={setVisibleCreate}
          refetch={refetch}
          title="Create users"
        />
      ) : null}

      <div className="content-card">
        <div className="flex justify-end mb-3">
          {checkPermission("faculty_delete") ? (
            <Tooltip placement="left" title={t("Delete")}>
              <DeleteData
                permission={"faculty_delete"}
                refetch={refetch}
                navigateUrl="/structural-unit/faculties"
                url={"faculties"}
                id={Number(_id)}
                className="mr-4"
              >
                <Button danger>
                  {t("Delete")}
                </Button>
              </DeleteData>
            </Tooltip>
          ) : null}
          {checkPermission('faculty_update') ? (<Button onClick={() => setVisibleEdit(true)}>{t("Edit")}</Button>) : null}
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

        <EmployeeIndexPage userAccessTypeId={1} />
      </div>
    </div>
  );
};

export default FacultyView;
