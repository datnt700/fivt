import { Card } from '@/app/components/card';
import Field from '@/app/components/field';
import { Label } from '@/app/components/label';
import { Layout } from '@/components/Layout';
import { Content } from '@/components/Layout/Content';
import React from 'react';

//  const data = [
//     {
//       input: <InputText />,
//       label: t('nameInput')
//     },
//     {
//       input: <InputText />,
//       label: t('emailInput')
//     },
//     {
//       input: <InputText />,
//       label: t('phoneInput')
//     },
//     {
//       input: <TextArea />,
//       label: t('noteInput')
//     }
//   ];

const Contact = () => {
  return (
    <Layout background="gradient">
      <Content>
        <section id="contact">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="w-full mb-2 md:w-1/2">
              <h1 className="font-bold text-5xl mb-1 md:text-6xl">title</h1>
              <p className="text-xl font-normal max-w-2xl md:text-2xl">
                Description
              </p>
            </div>
            <div className="w-full md:w-1/2">
              {/* <Card className="px-2.5 py-1.5 flex flex-col items-center gap-1">
                {data.map(item => (
                  <Field
                    key={item.label}
                    className={styles.field}
                    input={item.input}
                    label={<Label className={styles.label}>{item.label}</Label>}
                  />
                ))}
                <Button className="mt-0.5">Button</Button>
              </Card> */}
            </div>
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default Contact;
