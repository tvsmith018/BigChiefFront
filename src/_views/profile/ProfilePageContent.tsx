"use client";

import Image from "next/image";
import { Button, Card, Col, Container, Nav, Row } from "react-bootstrap";
import {
  ProfileListCard,
  ProfileMiniInfoCard,
  ProfileRibbonTitle, 
} from "@/_views/account/SharedPanels";

import { ProfileMePayload } from "@/_types/profile/profileMePayload";
const postImage = "/images/about/group.jpeg";

const activityTabs = ["My Posts", "Watch History", "My Ratings", "Photos"];

const accountCenterItems = [
  { icon: "bi-gear-fill", label: "Account Settings" },
  { icon: "bi-credit-card-2-front-fill", label: "Subscription & Billing" },
];

export default function ProfilePageContent({ profile }: { profile: ProfileMePayload }) {
    return <></>
}