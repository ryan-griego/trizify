import Head from "next/head";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getSession } from "@auth0/nextjs-auth0";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  const { isLoading, error, user } = useUser();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <>
      <Head>
        <title>TRIZify - Login or Signup</title>
      </Head>
      <div className="flex flex-col justify-center items-center min-h-screen w-full bg-gray-800 text-white text-center">

        {/* Main Content - Adjusted Spacing */}
        <div className="flex flex-col items-center mt-8">
          <FontAwesomeIcon icon={faCode} className="text-emerald-200 text-8xl mb-4" />
          <h1 className="text-4xl font-bold">TRIZify</h1>
          <h3 className="w-2/3 mx-auto text-center mt-2">
            Having trouble solving your engineering problems? TRIZify is here to help!
          </h3>
        </div>

        {/* Middle Section - Centered Text */}
        <div className="mt-20 mb-12 w-1/3 mx-auto text-center">
          <h3>
            TRIZify will use the&nbsp;
            <a
              href="https://www.triz40.com/aff_Principles_TRIZ.php"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline', color: 'inherit' }}
            >
              TRIZ principles
            </a>
            &nbsp;to help you systematically solve complex problems, innovate efficiently, and overcome contradictions.
          </h3>
        </div>

        {/* Login Section - Moved Higher */}
        <div className="mt-10">
          <p className="text-lg">Log in with your account to continue</p>
          <div className="mt-4 flex justify-center gap-3">
            {!user && (
              <>
                <Link href="/api/auth/login" className="btn">Login</Link>
                <Link href="/api/auth/signup" className="btn">Signup</Link>
              </>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req, ctx.res);
  if (!!session) {
    return {
      redirect: {
        destination: "/chat",
      },
    };
  }

  return {
    props: {},
  };
};
