import { motion } from "framer-motion";
import Image from "next/image";
import Nav from "react-bootstrap/Nav";
import Dropdown from "react-bootstrap/Dropdown";
import Link from "next/link";
import Logo from "../../../public/images/newlogo.jpg";
import localizationData from "@/_utilities/localization/en.json";
import { NavigationLink, NavigationUser } from "../../_types/navigation/navigation.types";
import { scaleFade } from "../animations/navigation.motion";
import { useAppSelector} from '@/_store/hooks/UseAppSelector';

interface Props {
  sideLinks: NavigationLink[];
}

export default function NavigationMenuPanel({
  sideLinks,
}: Props) {
  const data = useAppSelector((state) => state.user.data); 
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated); 
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={scaleFade}
    >
      <div className="text-center">
        <Image
          src={isAuthenticated && data?.avatar ? data.avatar : Logo}
          alt="User Avatar"
          width={200}
          height={200}
          className={isAuthenticated ? "rounded-circle" : ""}
        />
        {isAuthenticated && <p className="mt-3">Hey {data?.firstname} {data?.lastname}, this is where your user stat brief data is going to be placed.  Please help us grow while we building this stuff it takes time but we at the point the site will never be down again.</p>}
      </div>

      <Nav as="ul" className="flex-column mt-4">
        {sideLinks.map((link, idx) =>
          link.isDropdown ? (
            <Dropdown as={Nav.Item} key={idx}>
              <Dropdown.Toggle as={Nav.Link}>
                <span className="h5">{link.label}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {link.children?.map((child, i) => (
                  <Dropdown.Item key={i} href={`/articles/${child.category}`}>
                    {child.label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Nav.Item key={idx}>
              <Nav.Link href={`/articles/${link.route?.category}`}>
                <span className="h5">{link.route?.label}</span>
              </Nav.Link>
            </Nav.Item>
          )
        )}
      </Nav>

      <div className="p-4 mt-4 text-center rounded bg-opacity-50" style={{backgroundColor:"#F5deb3cc"}}>
        {!isAuthenticated ? (
          <>
            <h3>{localizationData.sidebar_alert_header}</h3>
            <p>{localizationData.sidebar_alert_para}</p>
            <a href="/auth" className="btn btn-primary" style={{backgroundColor:"#8b4513cc"}}>
              {localizationData.sidebar_alert_button}
            </a>
          </>
        ) : (
          <p>
            Welcome back, {data?.firstname} {data?.lastname}, please continue to check us out as we continue to add features to the site.  This is something legendary we doing.
          </p>
        )}
      </div>
    </motion.div>
  );
}
