export default interface ITraverseFile {
    path: string
    executable: boolean
    lastModified: number
    canWrite: boolean
    fileSize: number
}