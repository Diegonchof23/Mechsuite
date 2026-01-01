export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="flex items-center justify-center min-h-screen"
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.65) 100%), url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {children}
    </div>
  );
}