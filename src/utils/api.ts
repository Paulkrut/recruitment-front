export async function apiFetch(path:string, init:RequestInit = {}){
  const token = typeof window!=='undefined'?localStorage.getItem('recruitment_token'):null;
  const headers = new Headers(init.headers||{});
  if(token){ headers.set('Authorization', `Bearer ${token}`); }
  const res = await fetch(path,{...init,headers});
  if(res.status===401){
    localStorage.removeItem('recruitment_token');
    if(typeof window!=='undefined') window.location.href='/login';
  }
  return res;
} 