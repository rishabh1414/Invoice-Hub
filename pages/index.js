export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/invoices",
      permanent: false,
    },
  };
}

export default function Home() {
  return null;
}
