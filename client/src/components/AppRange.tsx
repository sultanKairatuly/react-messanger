import '../styles/ui.css'

type RangeProps = {
    title: string,
    step: number,
    value: number,
    onChange: (value: number) => void
    min: number,
    max: number
}
function Range(props: RangeProps){
    return (
        <div className="app_range_container">
            <div className="app_range_header">
            <h4 className="app_range_title">{props.title}</h4>
            <div className="app_range_value">{props.value}</div>
            </div>
            <input type="range" min={props.min} max={props.max} step={props.step} value={props.value} onChange={(e) => props.onChange(Number(e.target.value))} />
        </div>  
    )
}

export default Range