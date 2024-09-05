import {ReactNode} from 'react'
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import ViewInput from 'components/ViewInput';

interface DataType {
  name: string;
  value: ReactNode;
}

const GroupInfo =  ({data, isLoading}: {data: any, isLoading: any}) => {
  const {t} = useTranslation()

  const tableData: DataType[] = [
    {
      name: t("Name"),
      value: data?.unical_name,
    },
    {
      name: t("Faculty"),
      value: data?.faculty?.name,
    },
    {
      name: t("Direction"),
      value: <div>{data?.direction?.name}</div>,
    },
    {
      name: t("Edu plan"),
      value: <div>{data?.eduPlan?.name}</div>,
    },
    {
      name: t("CreatedBy"),
      value: (
        <div>
          <span className="text-gray-400">
            {t("name")}/{t("Last Name")}/{t("Role")} :{" "}
          </span>
          {data?.createdBy?.first_name} {data?.data?.createdBy?.last_name}{" "}
          (
          {data?.createdBy?.role.map((item: string) => {
            return item;
          })}
          )
          {/* <p>
            <span className="text-gray-400">{t("Login")}: </span>
            {data?.createdBy?.username}
          </p> */}
          <time className='block'>
            <span className="text-gray-400">{t("Date")}: </span>
            {dayjs.unix(data?.created_at).format("MM-DD-YYYY hh:mm:ss a")}
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
          {data?.updatedBy?.first_name} {data?.updatedBy?.last_name}{" "}
          (
          {data?.updatedBy?.role.map((item: string) => {
            return item;
          })}
          )
          {/* <p>
            <span className="text-gray-400">{t("Login")}: </span>
            {data?.updatedBy?.username}
          </p> */}
          <time className='block'>
            <span className="text-gray-400">{t("Date")}: </span>
            {dayjs.unix(data?.updated_at).format("MM-DD-YYYY hh:mm:ss a")}
          </time>
        </div>
      ),
    },
  ];

  return(
    <div className='mx-6'>
      <div className="grid xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
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
  )
}

export default GroupInfo