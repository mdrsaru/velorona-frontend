import { Avatar, Tooltip } from "antd";
import { User } from "../../interfaces/generated";

interface IProps {
  users: any;
}

const AssignedUserAvatar = (props: IProps) => {
  const users = props?.users;

  return (
    <>
      <Avatar.Group
        maxCount={2}
        size="large"
        maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf" }}
      >
        {users?.map((user: User, index: number) => (
          <Tooltip title={user?.fullName} placement="top" key={index}>
            {user?.avatar?.url ? (
              <Avatar src={user.avatar?.url}></Avatar>
            ) : (
              <Avatar style={{ backgroundColor: "#f56a00" }}>
                {user?.fullName?.charAt(0) ?? ""}
              </Avatar>
            )}
          </Tooltip>
        ))}
      </Avatar.Group>
    </>
  );
};

export default AssignedUserAvatar;
