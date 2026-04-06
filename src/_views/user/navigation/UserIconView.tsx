import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import Image from 'next/image';
import { logoutAction } from '@/_services/auth/authservices';
import { useAppDispatch } from '@/_store/hooks/UseAppDispatch';
import { useAppSelector} from '@/_store/hooks/UseAppSelector';
import { removeUser } from '@/_store/reducers/user/userSlice';



export default function UserIconView(){
    const data = useAppSelector((state) => state.user.data); 
    const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated); 
    const dispatch = useAppDispatch();
    const handleLogout = () => {
        console.log("logging out")
        logoutAction()
        dispatch(removeUser())
    }

    const GuestLinks = ()=><>
        <Dropdown.Item href="/auth">
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Login
        </Dropdown.Item>
        <div className="border-bottom border-2 border-primary opacity-1 mx-4 my-1"></div>
        <Dropdown.Item href="/auth">
            <i className="bi bi-door-open-fill me-2"></i>
            Create Profile
        </Dropdown.Item>
    </>

    const AuthLinks = ()=>(
        <Dropdown.Item href="#" role='button' onClick={handleLogout}>
            <i className="bi bi-box-arrow-in-left me-2"></i>
            Logout
        </Dropdown.Item>
    )

    return <Dropdown as={NavItem}>
            <Dropdown.Toggle as={NavLink} id="dropdown-basic" >
                {isAuthenticated && data?.avatar ? <Image className='rounded-circle' src={data.avatar} alt={`Image of ${data.firstname ?? ""} ${data.lastname ?? ""}`} width={35} height={35}/>:<i className="bi bi-person-circle" style={{fontSize:"20px"}}></i>}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {isAuthenticated ? <AuthLinks />:<GuestLinks />}
            </Dropdown.Menu>
    </Dropdown>
}
