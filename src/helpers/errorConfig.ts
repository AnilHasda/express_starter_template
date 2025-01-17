class ErrorConfig extends Error{
  constructor(
    public status:number,
    public message:string,
    public success:boolean=false
    ){
    super(message);
    this.status=status;
    this.success=success;
  }
}
export default ErrorConfig;