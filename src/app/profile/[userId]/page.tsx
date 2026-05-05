import { authProxyRoute } from "@/_services/auth/authproxy";
import { ProfileService } from "@/_services/profiles/profileservices";
import { parseProfileUserIdParam } from "@/_services/profiles/parseProfileUserIdParam";
import { redirect } from "next/navigation";
import OtherUserProfile from "@/_views/profile/otherUserProfile";
import { mapMemberProfileToView } from "@/_utilities/profile/mapProfileViewPayload";

type PageParams = Promise<{ userId: string }>;
type PageProps = Readonly<{ params: PageParams }>;

/**
 * Reads the current user from session cookies (refresh-aware) and logs their id.
 * Server-only; safe to call from async Server Components / route handlers.
 */
export async function logSessionUserId(): Promise<string | number | undefined> {
  const user = await authProxyRoute();
  const userId = user?.id;
  return userId
}

export default async function Page({ params }: PageProps) {
  const { userId } = await params;
  const decodeId = decodeURIComponent(userId);

  const myId = String(await logSessionUserId());
  const pageId = String(parseProfileUserIdParam(decodeId))

  if (myId == pageId){
    redirect("/profile")
  }

  const profileResponse = await ProfileService.getMemberProfile(decodeId);

  if (profileResponse.success) {
    return (
      <OtherUserProfile profile={mapMemberProfileToView(profileResponse.data)} />
    );
  }

  return <p>Cant load page</p>;
}
