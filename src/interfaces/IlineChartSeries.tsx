interface IlineChartSeries {
    id: number;
    data: number[]; 
    area: boolean; 
    curve: 'catmullRom' | 'linear' | 'monotoneX' | 'monotoneY' | 'natural' | 'step' | 'stepBefore' | 'stepAfter';
    label: string;
    state: boolean;
    stage: 'Active' | 'Paused' | 'Failed' | 'Validating' | 'Killed';
    address: string;
    interval: number;
    visible: boolean;
}

export default IlineChartSeries;