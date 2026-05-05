import { motion } from "framer-motion";
import Image from "next/image";
import Nav from "react-bootstrap/Nav";
import Dropdown from "react-bootstrap/Dropdown";
import Logo from "../../../public/images/newlogo.jpg";
import localizationData from "@/_utilities/localization/en.json";
import { PROFILE_AVATAR_PLACEHOLDER } from "@/_constants/profilePlaceholders";
import { toHttpsUrl } from "@/_utilities/url/toHttpsUrl";
import { NavigationLink } from "../../_types/navigation/navigation.types";
import { scaleFade } from "../animations/navigation.motion";
import { useAppSelector } from "@/_store/hooks/UseAppSelector";

interface Props {
  sideLinks: NavigationLink[];
}

export default function NavigationMenuPanel({
  sideLinks,
}: Readonly<Props>) {
  const data = useAppSelector((state) => state.user.data);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  const getSideLinkKey = (link: NavigationLink) =>
    link.id ??
    link.label ??
    link.route?.category ??
    link.route?.label ??
    JSON.stringify(link);

  const getChildKey = (category: string, label: string) => `${category}-${label}`;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={scaleFade}
    >
      <div className="text-center">
        {isAuthenticated && data?.avatar ? (
          <span
            style={{
              width: 200,
              height: 200,
              display: "inline-flex",
              borderRadius: "50%",
              overflow: "hidden",
            }}
          >
            <Image
              src={toHttpsUrl(data.avatar) ?? PROFILE_AVATAR_PLACEHOLDER}
              alt="User Avatar"
              width={200}
              height={200}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </span>
        ) : (
          <Image
            src={Logo}
            alt="User Avatar"
            width={200}
            height={200}
          />
        )}
        {isAuthenticated && <p className="mt-3">Hey {data?.firstname} {data?.lastname}, this is where your user stat brief data is going to be placed.  Please help us grow while we building this stuff it takes time but we at the point the site will never be down again.</p>}
      </div>

      <Nav as="ul" className="flex-column mt-4">
        {sideLinks.map((link) =>
          link.isDropdown ? (
            <Dropdown as={Nav.Item} key={getSideLinkKey(link)}>
              <Dropdown.Toggle as={Nav.Link}>
                <span className="h5">{link.label}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {link.children?.map((child) => (
                  <Dropdown.Item key={getChildKey(child.category, child.label)} href={`/articles/${child.category}`}>
                    {child.label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Nav.Item key={getSideLinkKey(link)}>
              <Nav.Link href={`/articles/${link.route?.category}`}>
                <span className="h5">{link.route?.label}</span>
              </Nav.Link>
            </Nav.Item>
          )
        )}
      </Nav>

      <div className="p-4 mt-4 text-center rounded bg-opacity-50" style={{ backgroundColor: "#F5deb3cc" }}>
        {isAuthenticated ? (
          <p>
            Welcome back, {data?.firstname} {data?.lastname}, please continue to check us out as we continue to add features to the site.  This is something legendary we doing.
          </p>
        ) : (
          <>
            <h3>{localizationData.sidebar_alert_header}</h3>
            <p>{localizationData.sidebar_alert_para}</p>
            <a href="/auth" className="btn btn-primary" style={{ backgroundColor: "#8b4513cc" }}>
              {localizationData.sidebar_alert_button}
            </a>
          </>
        )}
      </div>
    </motion.div>
  );
}
