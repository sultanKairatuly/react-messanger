import PageHeader from "./PageHeader";
import store from "../store/store";
import { useState, useRef } from "react";
import AppInput from "./AppInput";
import AppButton from "./AppButton";
import "../styles/newGroup.css";
import { GroupChat, SystemMessage, groupChatPredicate } from "../types";
import $api from "../api";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { getRandomColor } from "../utils";

const NewGroup = function NewGroup() {
  const [groupAvatar, setGroupAvatar] = useState("/blue_background.jpg");
  const [groupName, setGroupName] = useState("");
  const [groupBio, setGroupBio] = useState("");
  const navigate = useNavigate();
  const groupId = useRef(uuidv4());
  function handleAvatarClick() {
    const inputFile = document.createElement("input");
    inputFile.setAttribute("type", "file");
    inputFile.setAttribute("accept", "image/png, image/gif, image/jpeg");
    inputFile.addEventListener("change", () => {
      if (inputFile.files) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setGroupAvatar(e.target?.result?.toString() || "");
        };
        reader.readAsDataURL(inputFile.files[0]);
      }
    });
    inputFile.click();
  }

  async function handleNextButttonClick() {
    if (!store.user?.chats?.includes(groupId.current)) {
      const group: GroupChat = {
        type: "group",
        members: [
          {
            userId: store.user?.userId || "",
            role: "admin",
          },
        ],
        name: groupName,
        avatar:
          groupAvatar === "/blue_background.jpg" ? "default" : groupAvatar,
        chatId: groupId.current,
        id: uuidv4(),
        bio: groupBio,
        randomColor: getRandomColor(),
      };
      const { data: createdGroup } = await $api.post("/create-group", {
        group,
        creator: store.user?.userId,
      });

      if (groupChatPredicate(createdGroup)) {
        console.log("Verified!: ", createdGroup);
        const systemMessage: SystemMessage = {
          text: `${store.user?.name} created group "${groupName}"`,
          id: uuidv4(),
          createdAt: Date.now(),
          type: "system",
        };
        await $api.post(`/send-message`, {
          message: systemMessage,
          to: group.chatId,
          type: "group",
        });
        socket.emit("joinGroup", {
          chat: {
            chatId: group.chatId,
            members: group.members,
          },
          joiner: store.user,
          userChats: store.user?.chats,
        });
        navigate(`/a/${group.chatId}`);
      }
      store.newGroup = false;
      store.user?.chats.push(groupId.current);
    }
  }

  return (
    <div className="newgroup_container">
      <PageHeader
        title="New Group"
        handleBackClick={() => (store.newGroup = false)}
      />
      <div className="newgroup_content">
        <div className="group_avatar_wrapper" onClick={handleAvatarClick}>
          <img
            src={groupAvatar}
            alt="avatar of group"
            className="group_avatar"
          />
          {groupAvatar === "/blue_background.jpg" && (
            <i className="fa-solid fa-camera avatar_camera"></i>
          )}
        </div>
        <AppInput
          placeholder="Write your group name"
          labelTitle="Group Name"
          labelFor="GroupName"
          changeHandler={(e) => setGroupName(e.target.value)}
          value={groupName}
        />
        <br />
        <br />
        <AppInput
          placeholder="Write your description of group"
          labelTitle="Group Bio"
          labelFor="GroupBio"
          changeHandler={(e) => setGroupBio(e.target.value)}
          value={groupBio}
        />
      </div>
      {
        <div
          className={
            (groupName.length > 0
              ? "group_button_wrapper-active"
              : "group_button_wrapper-inactive") + " group_button_wrapper"
          }
        >
          <AppButton onClick={handleNextButttonClick}>Next</AppButton>
        </div>
      }
    </div>
  );
};

export default NewGroup;
