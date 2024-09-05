import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Button, Dropdown, Popover, Row, Switch, Table, Tag } from "antd";
import HeaderExtraLayout from "components/HeaderPage/headerExtraLayout";
import { CreateBtn } from "components/Buttons";
import FilterSelect, { TypeFilterSelect } from 'components/FilterSelect';
import Actions from 'components/Actions';
import { ColumnsType } from 'antd/es/table';
import checkPermission from 'utils/check_permission';
import { Link, useNavigate } from 'react-router-dom';
import { number_order } from 'utils/number_orders';
import useGetAllData from 'hooks/useGetAllData';
import useUrlQueryParams from 'hooks/useUrlQueryParams';
import CustomPagination from 'components/Pagination';
import { IFinalExam } from 'models/exam';
import { useAppSelector } from 'store';
import { useMutation } from '@tanstack/react-query';
import { finalExamStatusCheck } from './crud/requests';
import { Notification } from 'utils/notification';
import { AxiosError } from 'axios';
import { checkRole } from 'utils/others_functions';
import { MoreHorizontalFilled, MoreHorizontalRegular, MoreVertical24Filled, MoreVertical24Regular, MoreVerticalRegular } from '@fluentui/react-icons';

const selectData: TypeFilterSelect[] = [
  {
    name: "faculty_id",
    label: "Faculty",
    url: "faculties",
    permission: "faculty_index",
    child_names: ["direction_id", "direction_id", "edu_plan_id", "group_id", "edu_semestr_id", "edu_semestr_subject_id"],
    span: { xs: 24, sm: 24, md: 12, lg: 6, xl: 6 }
  },
  {
    name: "direction_id",
    label: "Direction",
    url: "directions",
    permission: "direction_index",
    parent_name: "faculty_id",
    child_names: ["edu_plan_id", "group_id", "edu_semestr_id", "edu_semestr_subject_id"],
    span: { xs: 24, sm: 24, md: 12, lg: 6, xl: 6 }
  },
  {
    name: "edu_plan_id",
    label: "Edu plan",
    url: "edu-plans",
    permission: "edu-plan_index",
    parent_name: "direction_id",
    child_names: ["group_id", "edu_semestr_id", "edu_semestr_subject_id"],
    span: { xs: 24, sm: 24, md: 12, lg: 6, xl: 6 }
  },
  {
    name: "edu_semestr_id",
    label: "Edu semestr",
    url: "/edu-semestrs",
    permission: "edu-semestr_index",
    parent_name: "edu_plan_id",
    child_names: ["edu_semestr_subject_id"],
    render: (e) => <div>{e?.name} {e?.status == 1 ? <Tag color="green" className="ml-3">Active</Tag> : ""}</div>,
    span: { xs: 24, sm: 24, md: 12, lg: 6, xl: 6 },
  },
  {
    name: "edu_semestr_subject_id",
    label: "Edu semestr subject",
    url: "/edu-semestr-subjects?expand=subject",
    permission: "edu-semestr-subject_index",
    render: (e) => <>{e?.subject?.name}</>,
    parent_name: "edu_semestr_id",
    span: { xs: 24, sm: 24, md: 12, lg: 6, xl: 6 },
  },
  {
    name: "group_id",
    label: "Group",
    url: "/groups",
    parent_name: "edu_plan_id",
    render: (e) => <>{e?.unical_name}</>,
    permission: "group_index",
    span: { xs: 24, sm: 24, md: 12, lg: 6, xl: 6 },
  },
  // {
  //   name: "date",
  //   label: "Date",
  //   type: "date",
  //   parent_name: "date",
  //   required: true,
  //   span,
  // },
  {
    name: "para_id",
    label: "Para",
    url: "/paras",
    permission: "para_index",
    child_names: ["user_id"],
    span: { xs: 24, sm: 24, md: 12, lg: 6, xl: 6 },
  },
  // {
  //   name: "user_id",
  //   label: "Mas'ul shaxs",
  //   url: `/teacher-accesses/free-exam?expand=profile&faculty_id=${faculty}&date=${dayjs(date).format("YYYY-MM-DD")}&para_id=${para}`,
  //   render: (e) => e?.profile?.last_name + " " + e?.profile?.first_name + " " + e?.profile?.middle_name,
  //   parent_name: "para_id",
  //   type: "select",
  //   required: true,
  //   span: { xs: 24, sm: 24, md: 12, lg: 6, xl: 6 },
  // },
  {
    name: "building_id",
    label: "Building",
    url: "/buildings",
    permission: "building_index",
    child_names: ["room_id"],
    span: { xs: 24, sm: 24, md: 12, lg: 6, xl: 6 },
  },
  {
    name: "room_id",
    label: "Rooms",
    url: `/rooms`,
    permission: "room_index",
    parent_name: "building_id",
    span: { xs: 24, sm: 24, md: 12, lg: 6, xl: 6 },
  },
  {
    name: "course_id",
    label: "Courses",
    url: `courses`,
    permission: "course_index",
    span: { xs: 24, sm: 24, md: 12, lg: 6, xl: 6 },
  },
  {
    name: "vedomst",
    label: "Shakl",
    permission: "room_index",
    staticData: [
      {id: 1, name: "1 shakl"},
      {id: 2, name: "1 A shakl"},
      {id: 3, name: "1 b shakl"},
    ],
    span: { xs: 24, sm: 24, md: 12, lg: 6, xl: 6 },
  },
  {
    name: "status",
    label: "Status",
    permission: "room_index",
    staticData: [
      {id: 1, name: "Faol emas"},
      {id: 2, name: "Faol"},
      {id: 3, name: "Baholanmoqda"},
      {id: 4, name: "Baholangan"},
      {id: 5, name: "Mudir tasdiqlagan"},
      {id: 6, name: "Dekan tasdiqlagan"},
      {id: 7, name: "Yakunlangan"},
    ],
    span: { xs: 24, sm: 24, md: 12, lg: 6, xl: 6 },
  },
  // {
  //   name: "faculty_id",
  //   label: "Faculty",
  //   url: "faculties",
  //   permission: "faculty_index",
  //   child_names: ["direction_id", "direction_id", "edu_plan_id", "group_id", "edu_semestr_id", "edu_semestr_subject_id"],
  //   span: { xs: 24, sm: 24, md: 12, lg: 6, xl: 6 }
  // },
]

export const renderExamStatus =  (status: number, className?: string) => {
  if(status === 1) return <span className={`text-red-600 bg-red-100 p-1 px-3 rounded-s-md ${className} `} >Faol emas</span>
  if(status === 2) return <span className={`text-green-500 bg-green-100 p-1 px-3 rounded-s-md ${className} `} >Faol</span>
  if(status === 3) return <span className={`text-orange-500 bg-orange-100 p-1 px-3 rounded-s-md ${className} `} >Baholanmoqda</span>
  if(status === 4) return <span className={`text-blue-600 bg-blue-100 p-1 px-3 rounded-s-md ${className} `} >Baholangan</span>
  if(status === 5) return <span className={`text-blue-600 bg-blue-100 p-1 px-3 rounded-s-md ${className} `} >Mudir tasdiqlagan</span>
  if(status === 6) return <span className={`text-blue-600 bg-blue-100 p-1 px-3 rounded-s-md ${className} `} >Dekan tasdiqlagan</span>
  if(status === 7) return <span className={`text-green-600 bg-green-100 p-1 px-3 rounded-s-md ${className} `} >Yakunlangan</span>
}

const NewExam: React.FC = (): JSX.Element => {
  const { t } = useTranslation();
  const [allData, setAllData] = useState<IFinalExam[]>([]);
  const { urlValue } = useUrlQueryParams({ currentPage: 1, perPage: 15 });
  const navigate = useNavigate();
  const user = useAppSelector(p => p?.auth?.user);

  const { data, refetch, isLoading } = useGetAllData<IFinalExam>({
    queryKey: ["final-exams", urlValue.perPage, urlValue.currentPage, urlValue?.filter, urlValue.filter_like],
    url: "final-exams?sort=-id&expand=eduPlan,eduPlan.faculty,eduSemestr.semestr,eduSemestrSubject.subject,building,room,para,user,groups.group",
    urlParams: { "per-page": urlValue.perPage, page: urlValue.currentPage, filter: JSON.stringify({...urlValue?.filter, vedomst: urlValue.filter_like.vedomst, status: urlValue.filter_like.status}) },
    options: {
      refetchOnWindowFocus: false,
      retry: 0,
      onSuccess: (res) => {
        setAllData(res?.items);
      }
    }
  })

  const columns: ColumnsType<IFinalExam> = React.useMemo(() => [
    {
      title: '№',
      dataIndex: 'order',
      render: (_, __, i) => number_order(urlValue.currentPage, urlValue.perPage, Number(i), isLoading),
      width: 45,
    },
    {
      title: t('Faculty'),
      dataIndex: 'eduPlan',
      width: 180,
      render: (e) => e?.faculty?.name
    },
    {
      title: t('Edu plan'),
      dataIndex: 'eduPlan',
      render: (e) => e?.name
    },
    {
      title: t('Semestr'),
      dataIndex: 'eduSemestr',
      width: 90,
      render: (e) => e?.semestr?.name
    },
    {
      title: t('Group'),
      dataIndex: "groups",
      render: (e) => e?.map((a: any) => <Tag className='border-0' >{a?.group?.unical_name}</Tag>),
    },
    {
      title: t('Subject'),
      dataIndex: 'eduSemestrSubject',
      render: (e) => e?.subject?.name
    },
    {
      title: t('Mas\'ul'),
      dataIndex: "user",
      render: (e) => <span>{e?.last_name} &nbsp; {e?.first_name} &nbsp; {e?.middle_name}</span>,
    },
    {
      title: t('Date'),
      width: 110,
      dataIndex: "date"
    },
    {
      title: t('Para'),
      dataIndex: 'para',
      width: 120,
      render: (e) => e?.name
    },
    {
      title: t('Shakl'),
      dataIndex: 'vedomst',
      width: 120,
      render: (e) => e === 1 ? "1 - shakl" : e === 2 ? "1 - A shakl" : e === 3 ? "1 - B shakl" : ""
    },
    {
      title: t('Joyi'),
      width: 110,
      render: (e) => <span>{e?.building?.name} / {e?.room?.name}</span>
    },
    // {
    //   title: t('Status'),
    //   fixed: "right",
    //   width: 180,
    //   align: "center",
    //   render: (e) => {
    //     if(e?.status == 2) return e?.user_id === user?.user_id && checkPermission("final-exam_in-charge") ? examStatusCheck(e?.id, 2) : <Tag color='gold' >Baholanmoqda</Tag>
    //     if(e?.status == 2) return user?.active_role === "mudir" && checkPermission("final-exam_confirm-mudir") ? examStatusCheck(e?.id, 3) : <Tag color='success'>Tekshirilgan</Tag>
    //     if(e?.status == 3) return user?.active_role === "dean" && checkPermission("final-exam_confirm-dean") ? examStatusCheck(e?.id, 4) : <Tag color='blue' >Mudir tasdiqlagan</Tag>
    //     if(e?.status == 4) return <Tag color='blue'>Dekan tasdiqlagan</Tag>
    //     return <Tag color='red'>Faol emas</Tag>
    //   }
    // },
    {
      title: t('Status'),
      fixed: "right",
      width: 190,
      align: "center",
      render: (e) => {
        return <>
          <div className="d-f justify-end">
            <div className="border-0 border-solid border-[#D9D9D9] bg-white rounded-s-md">{renderExamStatus(e?.status)}</div>
            <Popover content={
              <div className='flex flex-col gap-2' >
                <div className="flex-between">
                  <span>Faollashtirish:</span>&nbsp;&nbsp;
                  <Switch checkedChildren="Active" unCheckedChildren="InActive" checked={e?.status >= 2} onChange={(a) => mutate({ id: e?.id, status: a ? 1 : 0, type: 2 })} disabled={!(checkPermission("final-exam_confirm") && (e?.status === 2 || e?.status === 1))} />
                </div>
                <div className="flex-between">
                  <span>Tasdiqlash:</span>&nbsp;&nbsp;
                  <Switch checkedChildren="Active" unCheckedChildren="InActive" checked={e?.status >= 3} onChange={(a) => mutate({ id: e?.id, status: a ? 1 : 0, type: 3 })} disabled={!(checkPermission("final-exam_confirm-two") && (e?.status === 3 || e?.status === 2))} />
                </div>
                <div className="flex-between">
                  <span>Mas'ul:</span>&nbsp;&nbsp;
                  <Switch checkedChildren="Active" unCheckedChildren="InActive" checked={e?.status >= 4} onChange={(a) => mutate({ id: e?.id, status: a ? 1 : 0, type: 4 })} disabled={!(checkPermission("final-exam_in-charge") && (e?.status === 4 || e?.status === 3) && (checkRole("admin") || checkRole("edu_admin") || e?.user_id === user?.user_id))} />
                </div>
                <div className="flex-between">
                  <span>Mudir:</span>&nbsp;&nbsp;
                  <Switch checkedChildren="Active" unCheckedChildren="InActive" checked={e?.status >= 5} onChange={(a) => mutate({ id: e?.id, status: a ? 1 : 0, type: 5 })} disabled={!(checkPermission("final-exam_confirm-mudir") && (e?.status === 5 || e?.status === 4))} />
                </div>
                <div className="flex-between">
                  <span>Dekan:</span>&nbsp;&nbsp;
                  <Switch checkedChildren="Active" unCheckedChildren="InActive" checked={e?.status >= 6} onChange={(a) => mutate({ id: e?.id, status: a ? 1 : 0, type: 6 })} disabled={!(checkPermission("final-exam_confirm-dean") && (e?.status === 6 || e?.status === 5))} />
                </div>
                <div className="flex-between">
                  <span>Yakunlash:</span>&nbsp;&nbsp;
                  <Switch checkedChildren="Active" unCheckedChildren="InActive" checked={e?.status >= 7} onChange={(a) => mutate({ id: e?.id, status: a ? 1 : 0, type: 7 })} disabled={!(checkPermission("final-exam_last-confirm") && (e?.status === 7 || e?.status === 6))} />
                </div>
              </div>
            } title="Imtihon holat" trigger="click" placement='bottom' >
              <Button size='small' className="d-f px-2" style={{borderRadius: "0 4px 4px 0"}}><MoreHorizontalFilled fontSize={16}/></Button>
            </Popover>
          </div>
        </>
      }
    },
    // {
    //   title: t('Masul'),
    //   fixed: "right",
    //   width: 60,
    //   align: "center",
    //   render: (e) => {
    //     return <Switch checked={e?.status >= 2} onChange={(a) => mutate({ id: e?.id, status: a ? 1 : 0, type: 2 })} disabled={!(checkPermission("final-exam_in-charge") && (e?.status === 2 || e?.status === 1) && (checkRole("admin") || checkRole("edu_admin") || e?.user_id === user?.user_id))} />
    //   }
    // },
    // {
    //   title: t('Mudir'),
    //   fixed: "right",
    //   width: 60,
    //   align: "center",
    //   render: (e) => {
    //     return <Switch checked={e?.status >= 3} onChange={(a) => mutate({ id: e?.id, status: a ? 1 : 0, type: 3 })} disabled={!(checkPermission("final-exam_confirm-mudir") && (e?.status === 3 || e?.status === 2))} />
    //   }
    // },
    // {
    //   title: t('Dekan'),
    //   fixed: "right",
    //   width: 60,
    //   align: "center",
    //   render: (e) => {
    //     return <Switch checked={e?.status >= 4} onChange={(a) => mutate({ id: e?.id, status: a ? 1 : 0, type: 4 })} disabled={!(checkPermission("final-exam_confirm-dean") && (e?.status === 4 || e?.status === 3))} />
    //   }
    // },
    {
      title: t('Students'),
      fixed: "right",
      width: 80,
      align: "center",
      render: (e) => <Link to={`/exams/${e?.id}/students`}>Baholash</Link>
    },
    {
      title: t("Actions"),
      dataIndex: 'actions',
      width: 100,
      align: "center",
      fixed: "right",
      render: (_i, e) => <Actions
        id={e?.id}
        url={'final-exams'}
        refetch={refetch}
        onClickEdit={() => navigate(`/exams/update/${e?.id}`)}
        onClickView={() => navigate(`/exams/view/${e?.id}`)}
        viewPermission={'final-exam_view'}
        // viewPermission={'none_permission'}
        editPermission={"final-exam_update"}
        deletePermission={"final-exam_delete"}
      />,
    },
  ], [data?.items, urlValue]);

  const { mutate, isLoading: click } = useMutation({
    mutationFn: ({ id, status, type }: { id: number | undefined, status: number, type: number }) => finalExamStatusCheck(id, status, type),
    onSuccess: async (res) => {
      Notification("success", "update", res?.message);
      refetch()
    },
    onError: (error: AxiosError<any>) => {
      Notification("error", "update", error?.response?.data ? error?.response?.data?.message : "");
    },
    retry: 0,
  });

  return (
    <div className="">
      <HeaderExtraLayout title={`Final exam control`}
        breadCrumbData={[
          { name: "Home", path: '/' },
          { name: "Final exam control", path: 'exams' }
        ]}
        btn={
          <div className='flex'>
            {checkPermission("final-exam_create") ? <CreateBtn onClick={() => { navigate("/exams/create") }} permission={"final-exam_create"} /> : null}
          </div>
        }
      />

      <div className="px-[24px] py-[20px]">
        <Row gutter={[12, 12]}>
          {
            selectData?.map((e, i) => (
              <FilterSelect key={i} {...e} />
            ))
          }
        </Row>

        <Table
          columns={columns}
          dataSource={data?.items.length ? data?.items : allData}
          pagination={false}
          loading={isLoading}
          size="middle"
          className="mt-3"
          rowClassName="py-[12px]"
          scroll={{ x: 2000 }}
        />
        {(data?._meta?.totalCount ?? 0) > 10 ? <CustomPagination totalCount={data?._meta.totalCount} currentPage={urlValue.currentPage} perPage={urlValue.perPage} /> : undefined}
      </div>
    </div>
  );
};

export default NewExam;


/**
  * final-exam_index
  * final-exam_delete
  * final-exam_update
  * final-exam_view
  * final-exam_create
*/