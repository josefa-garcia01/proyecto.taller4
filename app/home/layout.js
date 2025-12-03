// Layout solo para /home
'use client';

export default function HomeLayout({ children }) {
  return (
    <div className="home-layout" style={{width: "1000px", margin: "60px auto"}}>      
      <main className="main-content" style={{marginLeft: "150px"}}>
        {children}
      </main>
    </div>
  );
}