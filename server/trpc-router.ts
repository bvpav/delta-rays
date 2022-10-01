import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import 'isomorphic-fetch';

const t = initTRPC.create();

export const appRouter = t.router({
  heading: t.procedure.query(() => ({ heading: 'Haqrecercnerq' })),
  images: t.procedure
    .input(
      z.object({
        page: z.number(),
      })
    )
    .query(async ({ input }) => {
      const url = new URL('https://www.nasa.gov/api/2/ubernode/_search');
      url.searchParams.set('size', '5');
      url.searchParams.set('from', input.page.toString());
      url.searchParams.set('sort', 'promo-date-time:desc');
      url.searchParams.set('q', '((ubernode-type:image) AND (missions:3698))');
      url.searchParams.set(
        '_source_include',
        'promo-date-time,master-image,nid,title,topics,missions,collections,other-tags,ubernode-type,primary-tag,secondary-tag,cardfeed-title,type,collection-asset-link,link-or-attachment,pr-leader-sentence,image-feature-caption,attachments,uri'
      );
      const res = await fetch(url);
      const obj = (await res.json()) as {
        took: number;
        timed_out: boolean;
        _shards: {
          total: number;
          successful: number;
          skipped: number;
          failed: number;
        };
        hits: {
          total: number;
          max_score: any;
          hits: {
            _type: string;
            _id: string;
            _score: any;
            _source: {
              'image-feature-caption': string;
              nid: string;
              title: string;
              type: string;
              uri: string;
              collections: string[];
              'link-or-attachment': 'link' | 'attachment';
              missions: string[];
              'primary-tag': string;
              'cardfeed-title': string;
              'promo-date-time': string;
              'secondary-tag': string;
              'master-image': {
                fid: string;
                alt: string;
                width: string;
                id: string;
                title: string;
                uri: string;
                height: string;
              };
              'ubernode-type': string;
            };
            sort: number[];
          }[];
        };
      };
      return obj.hits.hits.map(
        ({ _source }) =>
          'https://www.nasa.gov/sites/default/files/styles/full_width_feature/public' +
          new URL(_source['master-image'].uri.replace('://', ':///')).pathname
      );
    }),
});

export type AppRouter = typeof appRouter;
