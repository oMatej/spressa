import React from 'react';
import { NextPage } from 'next';
import { Thing } from '@spressa/react';

interface Props {
  pathname: string;
}

const Page: NextPage<Props> = ({ pathname }) => (
  <main>
    Test your request pathname: {pathname}
    <Thing test="PROP" />
  </main>
);

Page.getInitialProps = async ({ pathname }) => {
  return { pathname };
};

export default Page;
