import "../styles/primaryButton.css"

type PrimaryButtonProps = {
    children: string,
    onClick?: (...args: never[]) => unknown,
    className?: string 
}
function PrimaryButton({ children, onClick: clickHandler }: PrimaryButtonProps){
    return <button className="primary_button" onClick={clickHandler}>{children}</button>
}


export default PrimaryButton