import '../styles/settings.css'

type PageHeaderProp = {
  title: string;
  handleBackClick: () => void;
  handleEditClick?: () => void;
  handleEllipsisClick?: () => void;
};
function PageHeader({
  title,
  handleBackClick,
  handleEditClick,
  handleEllipsisClick,
}: PageHeaderProp) {
  return (
    <div className="settings_header">
      <div className="settings_header_head">
        <button
          className="back settings_header_button"
          onClick={handleBackClick}
        >
          <i className="fa-solid fa-left-long settings_header-icon"></i>
        </button>
        <h1 className="settings_header_title">{title}</h1>
      </div>
      {handleEditClick && handleEllipsisClick && (
        <div className="settings_header_tail">
          <button
            className="settings_header_edit settings_header_button"
            onClick={handleEditClick}
          >
            <i className="fa-solid fa-pen settings_header-icon"></i>
          </button>
          <button
            className="settings_header_dropdown settings_header_button"
            onClick={handleEllipsisClick}
          >
            <i className="fa-solid fa-ellipsis-vertical settings_header-icon"></i>
          </button>
        </div>
      )}
    </div>
  );
}

export default PageHeader;
