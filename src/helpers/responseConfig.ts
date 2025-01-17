class ResponseConfig{
  constructor(
    public status:number,
    public message:string | null,
    public data?:any,
    public isLoggedIn?:boolean,
    public isAuthonticate?:boolean,
    public success:boolean=true
    ){
    this.status=status;
    this.message=message;
    this.data=data;
    this.isLoggedIn=isLoggedIn;
    this.isAuthonticate=isAuthonticate;
    this.success=success;
  }
}
export default ResponseConfig;