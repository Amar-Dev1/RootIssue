export const cleanExplorerResponse = (response:string)=>{
return response.split('\n').join(', ');
}