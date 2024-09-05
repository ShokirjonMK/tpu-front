import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Col, Row, Form, Button, Spin, Tag } from "antd";
import HeaderExtraLayout from "components/HeaderPage/headerExtraLayout";
import { TypeFormUIData } from 'pages/common/types';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Notification } from 'utils/notification';
import { AxiosError } from 'axios';
import { validationErrors } from 'utils/validation_error';
import useGetOneData from 'hooks/useGetOneData';
import dayjs from 'dayjs';
import FormUIBuilder from 'components/FormUIBuilder';
import { submitFinalExamControl } from './requests';
import { IFinalExam } from 'models/exam';
import { IVedmost } from 'models/vedmost';
import { renderFullName } from 'utils/others_functions';

const span = { xs: 24, md: 24, lg: 12, xl: 12 };

const NewExamUpdate: React.FC = (): JSX.Element => {

  const { t } = useTranslation();
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm();

  const [para, setPara] = useState<number>()
  const [faculty, setFaculty] = useState<number>()
  const [date, setDate] = useState()
  const [building, setbuilding] = useState<any>();
  const [subjectVedomsts, setsubjectVedomsts] = useState<IVedmost[]>();
  const [SelectedVedomstType, setSelectedVedomstType] = useState<IVedmost[]>();

  const [click, setClick] = useState(false)

  const formData: TypeFormUIData[] = [
      {
        name: "faculty_id",
        label: "Faculty",
        url: "faculties",
        type: "select",
        child_names: ["edu_semestr_id", "group_id", "edu_plan_id"],
        onchange: (e: any) => setFaculty(e),
        required: true,
        span,
      },
      {
        name: "edu_plan_id",
        label: "Edu plan",
        url: "edu-plans",
        type: "select",
        parent_name: "faculty_id",
        child_names: ["edu_semestr_id", "group_id"],
        required: true,
        span,
      },
      {
        name: "edu_semestr_id",
        label: "Edu semestr",
        url: "/edu-semestrs",
        type: "select",
        parent_name: "edu_plan_id",
        child_names: ["edu_semestr_subject_id"],
        render: (e) => <div>{e?.name} {e?.status == 1 ? <Tag color="green" className="ml-3">Active</Tag>: ""}</div>,
        required: true,
        span,
      },
      {
        name: "edu_semestr_subject_id",
        label: "Edu semestr subject",
        url: "/edu-semestr-subjects",
        type: "select",
        expand: "subject,subjectVedomst",
        render: (e) => e?.subject?.name,
        parent_name: "edu_semestr_id",
        required: true,
        span,
        onchange(e: any, obj: any) {
          setsubjectVedomsts(obj?.subjectVedomst)
        },
      },
      id != "0" ? {
        name: "vedomst",
        label: "Vedmost",
        type: "select",
        parent_name: "edu_semestr_subject_id",
        required: true,
        data: subjectVedomsts?.map(i => ({id: i?.type, name: i?.type === 1 ? "1 - shakl" : i?.type === 2 ? "1 - A shakl" : i?.type === 3 ? "1 - B shakl" : ""})),
        span,
      } : {} as TypeFormUIData,
      {
        name: "group_id",
        label: "Group",
        url: "/groups",
        type: "multiselect",
        parent_name: "edu_plan_id",
        render: (e) => e?.unical_name,
        required: true,
        span,
      },
      {
        name: "date",
        label: "Date",
        type: "date",
        parent_name: "date",
        onchange: (e: any) => setDate(e),
        required: true,
        span,
      },
      {
        name: "para_id",
        label: "Para",
        url: "/paras",
        type: "select",
        child_names: ["user_id"],
        onchange: (e: any) => setPara(e),
        required: true,
        span,
      },
      {
        name: "user_id",
        label: "Mas'ul shaxs",
        url: `/teacher-accesses/free-exam?expand=profile&faculty_id=${faculty}&date=${dayjs(date).format("YYYY-MM-DD")}&para_id=${para}`,
        render: (e) => renderFullName(e?.profile),
        parent_name: "para_id",
        type: "select",
        required: true,
        span,
      },
      {
        name: "building_id",
        label: "Building",
        url: "/buildings",
        type: "select",
        child_names: ["room_id"],
        onchange: (e: any) => setbuilding(e),
        required: true,
        span,
      },
      {
        name: "room_id",
        label: "Rooms",
        url: `/rooms/free-exam?building_id=${building}&date=${dayjs(date).format("YYYY-MM-DD")}&para_id=${para}`,
        type: "select",
        parent_name: "building_id",
        required: true,
        span,
      }
  ];

  const { data, isFetching: getIsLoading } = useGetOneData<IFinalExam>({
    queryKey: ['final-exams', id],
    url: `final-exams/${id}?expand=eduPlan,eduPlan.faculty,eduSemestr.semestr,eduSemestrSubject.subject,eduSemestrSubject.subjectVedomst,groups`,
    options: {
      onSuccess: (res) => {
        form.setFieldsValue({
          edu_plan_id: res?.data?.edu_plan_id,
          faculty_id: res?.data?.eduPlan?.faculty_id,
          edu_semestr_id: res?.data?.edu_semestr_id,
          edu_semestr_subject_id: res?.data?.edu_semestr_subject_id,
          group_id: res?.data?.groups?.map((e: any) => e?.group_id),
          date: dayjs(res?.data?.date),
          para_id: res?.data?.para_id,
          user_id: res?.data?.user_id,
          building_id: res?.data?.building_id,
          room_id: res?.data?.room_id,
          vedomst: res?.data?.vedomst,
        })
        setPara(res?.data?.para_id)
        setbuilding(res?.data?.building_id)
        setFaculty(res?.data?.eduPlan?.faculty_id);
        setsubjectVedomsts(res?.data?.eduSemestrSubject?.subjectVedomst);        
      },
      refetchOnWindowFocus: false,
      retry: 0,
      enabled: (!!id && id != '0'),
    }
  })

  const { mutate, isLoading } = useMutation({
    mutationFn: (newVals) => submitFinalExamControl(id, newVals),
    onSuccess: async (res) => {
      Notification("success", id ? "update" : "create", res?.message)
      if(click) navigate(-1);
    },
    onError: (error: AxiosError<any>) => {
      Notification("error", id ? "update" : "create", error?.response?.data ? error?.response?.data?.message : "");
      validationErrors(form, error?.response?.data)
    },
    retry: 0,
  });

  const title = id ? (data?.data?.name ? data?.data?.name : "Final exam update") : `Final exam create`;

  return (
    <Spin spinning={getIsLoading} >
      <HeaderExtraLayout title={title}
        breadCrumbData={[
          { name: "Home", path: '/' },
          { name: "Final exam control", path: '/exams' },
          { name: title, path: '/exams/create' }
        ]}
        isBack={true}
      />
      <div className="px-[24px] py-[20px]">
        <Form
          initialValues={{ status: true }}
          form={form}
          layout="vertical"
          onFinish={(values) => mutate({...values})}
        >
          <Row gutter={24} className="mb-[50px]">
            <Col xxl={16} lg={20}>
              <Row gutter={24}>
                <FormUIBuilder data={formData} form={form} load={!!Number(id)} />
              </Row>
            </Col>
          </Row>

          <div className="flex justify-end fixed bottom-0 right-0 bg-white w-[100%] px-[24px] py-[16px] shadow-2xl">
            <Button htmlType="button" onClick={() => form.resetFields()}>{t("Reset")}</Button>
            <Button type="primary" loading={isLoading} className="ml-3" htmlType="submit" onClick={() => setClick(false)} >{t("Submit")}</Button>
            <Button type="primary" loading={isLoading} className="ml-3" htmlType="submit" onClick={() => setClick(true)} >{t("Saqlash va yakunlash")}</Button>
          </div>
        </Form>
      </div>
    </Spin>
  );
};

export default NewExamUpdate;