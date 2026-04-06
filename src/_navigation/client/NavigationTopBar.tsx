import Link from "next/link";
import Container from "react-bootstrap/Container";
import UserIconView from "@/_views/user/navigation/UserIconView";

interface Props {
  links: string[];
}

export default function NavigationTopBar({
  links,
}: Props) {
  return (
    <div className="navbar-top d-block small">
      <Container>
        <div className="d-flex justify-content-between align-items-center my-2">
          <ul className="nav">
            {links.map((link, index) => (
              <li className="nav-item" key={index}>
                <Link
                  className="nav-link"
                  href={`/information/${link.replace("/", "_")}`}
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>

          <UserIconView/>
        </div>

        <div className="border-bottom border-2 border-primary opacity-1" />
      </Container>
    </div>
  );
}
