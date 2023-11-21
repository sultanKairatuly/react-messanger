function MessageContext(){
    return (
        <div>

        </div>
    )
}

export default MessageContext;

const renderMessageContextMenu = useCallback(
    function renderMessageContextMenu(message: Message) {
      if (message.type === "system") return;
      const commonContextMenuItems: GrayMenuItemType[] = [
        {
          title: "Reply",
          icon: "fa-solid fa-reply",
          id: uuidv4(),
          action() {
            setContextMenu("");
            enableScroll();
          },
        },
        {
          title: "Forward",
          icon: "fa-solid fa-share",
          id: uuidv4(),
          action(message) {
            context.setIsForwardMessage(true);
            message && context.setActiveMessages([message]);
            setContextMenu("");
            enableScroll();
          },
        },
        {
          title: "Select",
          icon: "fa-solid fa-circle-check",
          id: uuidv4(),
          action(message) {
            setContextMenu("");
            textMessagePredicate(message) &&
              setSelectedMessages((msgs) => [...msgs, message]);
            enableScroll();
          },
        },
        {
          title: "Copy Text",
          icon: "fa-solid fa-clone",
          id: uuidv4(),
          action(message) {
            navigator.clipboard.writeText(message?.text || "").then(() => {
              store.setNotificationMessage("Text is copied!");
            });
            setContextMenu("");
            enableScroll();
          },
        },
      ];
      const personalContextMenuItems: GrayMenuItemType[] = [
        {
          title: "Delete",
          icon: "fa-solid fa-trash",
          id: uuidv4(),
          async action(message) {
            await $api.post(
              `/delete-message?to=${to}&messageId=${message?.id}&user1=${store.user?.userId}&user2=${chatId}`
            );
            store.setNotificationMessage("Message was deleted!");
            setContextMenu("");
            enableScroll();
          },
        },
      ];
      if (message.author.userId === store.user?.userId) {
        return (
          <div
            className={
              (contextMenu === message.id
                ? "context_menu_wrapper_active"
                : "") + " context_menu_wrapper"
            }
            style={{
              top: contextPosition.y,
              transform: `translateX(${contextPosition.x - 300}px)`,
            }}
          >
            <GrayMenu
              isMenu={contextMenu === message.id}
              message={message}
              items={[...commonContextMenuItems, ...personalContextMenuItems]}
            />
          </div>
        );
      } else {
        return (
          <div
            className={"context_menu_wrapper"}
            style={{
              top: contextPosition.y,
              transform: `translateX(${contextPosition.x - 300}px)`,
            }}
          >
            <GrayMenu
              isMenu={contextMenu === message.id}
              message={message}
              items={commonContextMenuItems}
            />
          </div>
        );
      }
    },
    []
  );