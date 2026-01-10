import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { useActionState, startTransition } from 'react';
import { logoutAction } from '../../../../_utilities/network/Authorization/actions/auth';
import { useDispatch } from 'react-redux';
import { removeUser } from '@/_store/reducers/userReducer/userSlice';

export default function UserIconView({isAuthenticated, data}:{isAuthenticated:boolean, data?:{firstname:string, lastname:string, avatarURL?:string}}){
    let initialState: {isAuthenticated:boolean, data?:{firstname:string, lastname:string, avatarURL?:string}}
    const dispatch = useDispatch();

    initialState = {
        isAuthenticated: isAuthenticated,
        data: data
    };

    const [state, action, pending] = useActionState(logoutAction, undefined)

    const handleLogout = () => {
        startTransition(() => {
            action()
        })
        dispatch(removeUser())
    }

    return <Dropdown as={NavItem}>
        <Dropdown.Toggle as={NavLink} id="dropdown-basic" >
            {isAuthenticated && data && data.avatarURL ? <Image className='rounded-circle' src={data.avatarURL} alt={`Image of ${data.firstname} ${data.lastname}`} width={30} height={30}/>:<i className="bi bi-person-circle" style={{fontSize:"20px"}}></i>}
        </Dropdown.Toggle>
        {isAuthenticated ? 
        <Dropdown.Menu>
            <Dropdown.Item href="#" role='button' onClick={handleLogout}>
                <i className="bi bi-box-arrow-in-left me-2"></i>
                Logout
            </Dropdown.Item>
        </Dropdown.Menu>
        :
        <Dropdown.Menu>
            <Dropdown.Item href="/auth">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login
            </Dropdown.Item>
            <div className="border-bottom border-2 border-primary opacity-1 mx-4 my-1"></div>
            <Dropdown.Item href="/auth">
                <i className="bi bi-door-open-fill me-2"></i>
                Create Profile
            </Dropdown.Item>
        </Dropdown.Menu>
        }
    </Dropdown>
}