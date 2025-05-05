
export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} AutoZen Services. All rights reserved.</p>
      </div>
    </footer>
  );
}
