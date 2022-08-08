import React from "react";
import style from "./style.module.scss";

const PolicyCard = ({
  title,
  lastUpdated,
}: {
  title: string;
  lastUpdated: string;
}) => {
  return (
    <div className={style["policy-header-card"]}>
      <p className={style['policy-title']}>
        {title}
      </p>
      <p className={style['policy-date']}>Last Updated on {lastUpdated}</p>
    </div>
  );
};

export default PolicyCard;
