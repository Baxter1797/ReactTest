interface ITraverseDir {
    id: string;
    fileName: string;
    type: string;
    path: string;
    children?: ITraverseDir[];
}

export default ITraverseDir